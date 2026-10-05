import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { hashToken, criarContaConvite, emitirLinkConta } from "./convitesController.js";
import { emailNormalizado, validarId, validarUtilizador, objeto } from '../utils/inputValidation.js';
import db, { pool } from "../config/db.js";


const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)))
  );

/*
|--------------------------------------------------------------------------
| Mensagem genérica de credenciais inválidas
|--------------------------------------------------------------------------
|
| Reaproveitada para email inexistente, conta inativa e password errada —
| impede que um atacante enumere contas válidas observando respostas
| diferentes (OWASP A07 / M2).
|
*/
const CREDENCIAIS_INVALIDAS = { message: "Credenciais inválidas." };

export const register = (_req, res) => {
  return res.status(403).json({ message: "As contas são criadas por convite do administrador. Contacte a igreja." });
};

export const login = async (req, res) => {
  try {
    const body = objeto(req.body);
    const email = emailNormalizado(body.email, true);
    const password = body.password;

    if (typeof password !== 'string' || !password || password.length > 1024) {
      return res.status(400).json({ message: "Preencha todos os campos." });
    }

    const result = await query("SELECT * FROM utilizadores WHERE lower(trim(email)) = $1", [email]);
    if (result.length !== 1) {
      return res.status(401).json(CREDENCIAIS_INVALIDAS);
    }

    const user = result[0];

    /*
    |------------------------------------------------------------------
    | Conta inativa tratada como credenciais inválidas
    |------------------------------------------------------------------
    |
    | Devolver aqui uma mensagem distinta ("Conta inativa...") permitiria
    | a um atacante distinguir "email não existe" de "email existe mas
    | está inativo" — uma enumeração de contas. Por isso a resposta é a
    | mesma genérica usada para password errada.
    |
    */
    if (user.estado !== "Ativo" || user.convite_pendente) {
      return res.status(401).json(CREDENCIAIS_INVALIDAS);
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json(CREDENCIAIS_INVALIDAS);
    }

    query("UPDATE utilizadores SET ultimo_acesso = NOW() WHERE id = $1", [user.id])
      .catch((e) => console.warn("[login] ultimo_acesso:", e.message));

    /* Algoritmo de assinatura fixado explicitamente (ver também middleware/auth.js). */
    const token = jwt.sign(
      { id: user.id, perfil: user.perfil, session_version: user.session_version },
      process.env.JWT_SECRET,
      { expiresIn: "1d", algorithm: "HS256" }
    );

    res.json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil },
    });
  } catch (e) {
    if (e.status === 400) return res.status(400).json({ message: e.message });
    console.error("[login]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const recuperarPassword = emitirLinkConta('recuperar');

export const redefinirPassword = async (req, res) => {
  let client;
  try {
    const { token, nova_password } = req.body;

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token) || typeof nova_password !== "string" || !nova_password) {
      return res.status(400).json({ message: "Token e nova palavra-passe são obrigatórios." });
    }
    if (nova_password.length < 8 || Buffer.byteLength(nova_password, 'utf8') > 72) {
      return res.status(400).json({ message: "A palavra-passe deve ter pelo menos 8 caracteres e ocupar no máximo 72 bytes." });
    }

    const hash = await bcrypt.hash(nova_password, 10);
    client = await pool.connect();
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE password_resets SET usado = 1
       WHERE token = $1 AND usado = 0 AND expiry > NOW()
       RETURNING id, utilizador_id`,
      [hashToken(token)]
    );
    if (result.rowCount !== 1) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Link inválido, expirado ou já utilizado." });
    }
    const reset = result.rows[0];
    const updated = await client.query(
      "UPDATE utilizadores SET password = $1, convite_pendente = false, session_version = session_version + 1 WHERE id = $2 AND estado = 'Ativo'",
      [hash, reset.utilizador_id]
    );
    if (updated.rowCount !== 1) throw new Error("Conta não encontrada.");
    await client.query("UPDATE password_resets SET usado = 1 WHERE utilizador_id = $1", [reset.utilizador_id]);
    await client.query("COMMIT");

    res.json({ message: "Palavra-passe atualizada com sucesso!" });
  } catch (e) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    console.error("[redefinirPassword]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  } finally {
    client?.release();
  }
};

export const getUsers = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, nome, email, perfil, estado, convite_pendente,
              TO_CHAR(ultimo_acesso, 'DD/MM/YYYY HH24:MI') AS ultimo_acesso,
              TO_CHAR(created_at, 'DD/MM/YYYY')        AS criado
       FROM utilizadores
       ORDER BY id DESC`
    );
    res.json(result);
  } catch (e) {
    /* Compatibilidade com bases de dados antigas onde a coluna ultimo_acesso ainda não existe. */
    if (e.code === "42703") {
      try {
        const result = await query(
          `SELECT id, nome, email, perfil, estado,
                  NULL AS ultimo_acesso,
                  TO_CHAR(created_at, 'DD/MM/YYYY') AS criado
           FROM utilizadores ORDER BY id DESC`
        );
        return res.json(result);
      } catch (e2) {
        console.error("[getUsers fallback]", e2);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
    }
    console.error("[getUsers]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const criarUtilizador = criarContaConvite;
export const reenviarConvite = emitirLinkConta('convite');

export const updateUser = async (req, res) => {
  try {
    const id = validarId(req.params.id);
    const { nome, perfil, estado } = validarUtilizador(req.body);

    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: "Não pode alterar o seu próprio perfil ou estado aqui." });
    }
    const result = await query(
      "UPDATE utilizadores SET nome = $1, perfil = $2, estado = $3, session_version = session_version + 1 WHERE id = $4",
      [nome, perfil, estado, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: "Utilizador não encontrado." });
    res.json({ message: "Utilizador atualizado com sucesso." });
  } catch (e) {
    if (e.status === 400) return res.status(400).json({ message: e.message });
    console.error("[updateUser]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = validarId(req.params.id);

    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: "Não pode eliminar a sua própria conta." });
    }

    const result = await query("DELETE FROM utilizadores WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Utilizador não encontrado." });

    res.json({ message: "Utilizador eliminado com sucesso." });
  } catch (e) {
    if (e.status === 400) return res.status(400).json({ message: e.message });
    if (e.code === '23503') return res.status(409).json({ message: 'Esta conta tem registos associados. Desative-a em vez de eliminar.' });
    console.error("[deleteUser]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const resetUserPassword = emitirLinkConta('reset');
