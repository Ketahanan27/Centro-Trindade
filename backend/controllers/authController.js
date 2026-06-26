import bcrypt  from "bcrypt";
import jwt     from "jsonwebtoken";
import db      from "../config/db.js";

export const register = async (req, res) => {
  try {
    const { nome, email, password, perfil } = req.body;

    if (!nome || !email || !password) {
      return res.status(400).json({
        message: "Preencha todos os campos."
      });
    }

    db.query(
      "SELECT id FROM utilizadores WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          // CORRIGIDO: era res.status(500).json(err) — expunha o objeto de
          // erro MySQL completo (query, estrutura da tabela, etc.) ao cliente
          console.error("[register]", err);
          return res.status(500).json({ message: "Erro interno do servidor." });
        }

        if (result.length > 0) {
          return res.status(400).json({ message: "Email já registado." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          `INSERT INTO utilizadores (nome, email, password, perfil)
           VALUES (?, ?, ?, ?)`,
          [nome, email, hashedPassword, perfil || "Membro"],
          (err) => {
            if (err) {
              console.error("[register insert]", err);
              return res.status(500).json({ message: "Erro interno do servidor." });
            }
            res.status(201).json({ message: "Utilizador registado com sucesso." });
          }
        );
      }
    );
  } catch (error) {
    console.error("[register catch]", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const login = async (req, res) => {

  // CORRIGIDO: removido console.log("LOGIN CHAMADO") — log de debug
  // esquecido em produção, poluía os logs do servidor

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Preencha todos os campos." });
    }

    db.query(
      "SELECT * FROM utilizadores WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          console.error("[login]", err);
          return res.status(500).json({ message: "Erro interno do servidor." });
        }

        if (result.length === 0) {
          return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const user = result[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const token = jwt.sign(
          { id: user.id, perfil: user.perfil },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        res.json({
          token,
          user: {
            id:     user.id,
            nome:   user.nome,
            email:  user.email,
            perfil: user.perfil,
          }
        });
      }
    );
  } catch (error) {
    console.error("[login catch]", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};