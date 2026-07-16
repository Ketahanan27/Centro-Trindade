import bcrypt     from "bcrypt";
import jwt        from "jsonwebtoken";
import crypto     from "crypto";
import db         from "../config/db.js";
import nodemailer from "nodemailer";

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)))
  );

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PERFIS_VALIDOS = ["Administrador", "Pastor", "Secretaria", "Tesouraria", "Membro"];

const criarTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

export const register = async (req, res) => {
  try {
    const { nome, email, password } = req.body;

    if (!nome?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Formato de email inválido." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "A palavra-passe deve ter pelo menos 6 caracteres." });
    }

    const existe = await query("SELECT id FROM utilizadores WHERE email = ?", [email.trim()]);
    if (existe.length > 0) {
      return res.status(400).json({ message: "Email já registado." });
    }

    const hash = await bcrypt.hash(password, 10);

    await query(
      "INSERT INTO utilizadores (nome, email, password, perfil) VALUES (?, ?, ?, ?)",
      [nome.trim(), email.trim(), hash, "Membro"]
    );

    res.status(201).json({ message: "Conta criada com sucesso." });

  } catch (e) {
    console.error("[register]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Preencha todos os campos." });
    }

    const result = await query(
      "SELECT * FROM utilizadores WHERE email = ?",
      [email.trim()]
    );

    if (result.length === 0) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const user = result[0];

    if (user.estado !== "Ativo") {
      return res.status(401).json({ message: "Conta inativa. Contacte o administrador." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    query("UPDATE utilizadores SET ultimo_acesso = NOW() WHERE id = ?", [user.id])
      .catch((e) => console.warn("[login] ultimo_acesso:", e.message));

    const token = jwt.sign(
      { id: user.id, perfil: user.perfil },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil },
    });

  } catch (e) {
    console.error("[login]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const recuperarPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ message: "Email obrigatório." });
    }

    const result = await query(
      "SELECT id, nome FROM utilizadores WHERE email = ? AND estado = 'Ativo'",
      [email.trim()]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Nenhuma conta ativa encontrada com este email." });
    }

    const user   = result[0];
    const token  = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 30 * 60 * 1000); 

    await query("DELETE FROM password_resets WHERE utilizador_id = ?", [user.id]);
    await query(
      "INSERT INTO password_resets (utilizador_id, token, expiry) VALUES (?, ?, ?)",
      [user.id, token, expiry]
    );

    const link = `${process.env.FRONTEND_URL}/redefinir-password?token=${token}`;

    await criarTransporter().sendMail({
      from:    `"Centro Trindade" <${process.env.EMAIL_USER}>`,
      to:      email.trim(),
      subject: "🔐 Recuperação de Palavra-passe — Centro Trindade",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0044ff;color:#fff;padding:30px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="margin:0">Centro Trindade</h1></div>
        <div style="padding:30px;background:#fff">
          <h2 style="color:#0044ff">Olá, ${user.nome}!</h2>
          <p>Recebemos um pedido para recuperar a palavra-passe da sua conta.</p>
          <a href="${link}" style="display:block;width:fit-content;margin:24px auto;padding:14px 32px;background:#0044ff;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">
            Redefinir Palavra-passe</a>
          <p style="color:#888;font-size:13px">⚠️ Válido 30 minutos. Uso único.</p>
        </div></div>`,
    });

    res.json({ message: "Email enviado! Verifique a sua caixa de correio." });

  } catch (e) {
    console.error("[recuperarPassword]", e.message);
    if (e.code === "EAUTH" || e.responseCode >= 500) {
      return res.status(500).json({ message: "Erro ao enviar email. Verifique as credenciais no .env." });
    }
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const redefinirPassword = async (req, res) => {
  try {
    const { token, nova_password } = req.body;

    if (!token || !nova_password) {
      return res.status(400).json({ message: "Token e nova palavra-passe são obrigatórios." });
    }
    if (nova_password.length < 6) {
      return res.status(400).json({ message: "Mínimo 6 caracteres." });
    }

    const result = await query(
      "SELECT id, utilizador_id, expiry, usado FROM password_resets WHERE token = ?",
      [token]
    );

    if (result.length === 0) {
      return res.status(400).json({ message: "Link inválido ou já utilizado." });
    }

    const reset = result[0];

    if (reset.usado) {
      return res.status(400).json({ message: "Este link já foi utilizado. Solicite um novo." });
    }
    if (new Date() > new Date(reset.expiry)) {
      return res.status(400).json({ message: "Link expirado. Solicite um novo." });
    }

    const hash = await bcrypt.hash(nova_password, 10);

    await query("UPDATE utilizadores SET password = ? WHERE id = ?", [hash, reset.utilizador_id]);
    await query("UPDATE password_resets SET usado = 1 WHERE id = ?", [reset.id]);

    res.json({ message: "Palavra-passe atualizada com sucesso!" });

  } catch (e) {
    console.error("[redefinirPassword]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const getUsers = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, nome, email, perfil, estado,
              DATE_FORMAT(ultimo_acesso, '%d/%m/%Y %H:%i') AS ultimo_acesso,
              DATE_FORMAT(created_at,   '%d/%m/%Y')        AS criado
       FROM utilizadores
       ORDER BY id DESC`
    );
    res.json(result);
  } catch (e) {
    if (e.code === "ER_BAD_FIELD_ERROR") {
      try {
        const result = await query(
          `SELECT id, nome, email, perfil, estado,
                  NULL AS ultimo_acesso,
                  DATE_FORMAT(created_at, '%d/%m/%Y') AS criado
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

export const criarUtilizador = async (req, res) => {
  try {
    const { nome, email, perfil, estado } = req.body;

    if (!nome?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Nome e email são obrigatórios." });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Formato de email inválido." });
    }

    const perfilFinal = PERFIS_VALIDOS.includes(perfil) ? perfil : "Membro";

    const existe = await query(
      "SELECT id FROM utilizadores WHERE email = ?",
      [email.trim()]
    );
    if (existe.length > 0) {
      return res.status(400).json({ message: "Email já registado." });
    }

    const tempPass = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);

    const insertResult = await query(
      "INSERT INTO utilizadores (nome, email, password, perfil, estado) VALUES (?, ?, ?, ?, ?)",
      [nome.trim(), email.trim(), tempPass, perfilFinal, estado || "Ativo"]
    );

    const userId = insertResult.insertId;
    const token  = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000); 

    await query(
      "INSERT INTO password_resets (utilizador_id, token, expiry) VALUES (?, ?, ?)",
      [userId, token, expiry]
    );

    const link = `${process.env.FRONTEND_URL}/redefinir-password?token=${token}`;

    try {
      await criarTransporter().sendMail({
        from:    `"Centro Trindade" <${process.env.EMAIL_USER}>`,
        to:      email.trim(),
        subject: "🎉 Bem-vindo ao Centro Trindade — Configure a sua conta",
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0044ff;color:#fff;padding:30px;text-align:center;border-radius:12px 12px 0 0">
            <h1 style="margin:0">Centro Trindade</h1></div>
          <div style="padding:30px;background:#fff">
            <h2 style="color:#0044ff">Olá, ${nome.trim()}!</h2>
            <p>Foi criada uma conta com o perfil <strong>${perfilFinal}</strong>.</p>
            <a href="${link}" style="display:block;width:fit-content;margin:24px auto;padding:14px 32px;background:#0044ff;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">
              Configurar Conta</a>
            <p style="color:#888;font-size:13px">⚠️ Válido por 48 horas.</p>
          </div></div>`,
      });
      res.status(201).json({ message: `Utilizador criado. Email enviado para ${email.trim()}.` });
    } catch (emailErr) {
      console.error("[criarUtilizador email]", emailErr.message);
      res.status(201).json({
        message: "Utilizador criado, mas o email falhou. Verifique as credenciais de email no .env.",
      });
    }

  } catch (e) {
    console.error("[criarUtilizador]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, perfil, estado } = req.body;

    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: "Não pode alterar o seu próprio perfil ou estado aqui." });
    }

    if (perfil && !PERFIS_VALIDOS.includes(perfil)) {
      return res.status(400).json({ message: "Perfil inválido." });
    }

    await query(
      "UPDATE utilizadores SET nome = ?, perfil = ?, estado = ? WHERE id = ?",
      [nome, perfil, estado, id]
    );

    res.json({ message: "Utilizador atualizado com sucesso." });

  } catch (e) {
    console.error("[updateUser]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: "Não pode eliminar a sua própria conta." });
    }

    await query("DELETE FROM utilizadores WHERE id = ?", [id]);

    res.json({ message: "Utilizador eliminado com sucesso." });

  } catch (e) {
    console.error("[deleteUser]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      "SELECT email, nome FROM utilizadores WHERE id = ?",
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    const user   = result[0];
    const token  = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    await query("DELETE FROM password_resets WHERE utilizador_id = ?", [id]);
    await query(
      "INSERT INTO password_resets (utilizador_id, token, expiry) VALUES (?, ?, ?)",
      [id, token, expiry]
    );

    const link = `${process.env.FRONTEND_URL}/redefinir-password?token=${token}`;

    await criarTransporter().sendMail({
      from:    `"Centro Trindade" <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: "🔐 Reset de Palavra-passe — Centro Trindade",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0044ff;color:#fff;padding:30px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="margin:0">Centro Trindade</h1></div>
        <div style="padding:30px;background:#fff">
          <h2 style="color:#0044ff">Olá, ${user.nome}!</h2>
          <p>O administrador solicitou o reset da sua palavra-passe.</p>
          <a href="${link}" style="display:block;width:fit-content;margin:24px auto;padding:14px 32px;background:#0044ff;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">
            Redefinir Palavra-passe</a>
          <p style="color:#888;font-size:13px">⚠️ Válido por 24 horas.</p>
        </div></div>`,
    });

    res.json({ message: `Link de reset enviado para ${user.email}.` });

  } catch (e) {
    console.error("[resetUserPassword]", e.message);
    res.status(500).json({ message: "Erro ao enviar email ou erro interno." });
  }
};
