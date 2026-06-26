import db from "../config/db.js";

export const createMember = (req, res) => {

  const {
    nome, email, telemovel, nascimento, sexo,
    estado_civil, morada, codigo_postal,
    entrada, batizado, estado
  } = req.body;

  if (!nome?.trim() || !email?.trim()) {
    return res.status(400).json({ message: "Nome e email são obrigatórios." });
  }

  const sql = `
    INSERT INTO membros
      (nome, email, telemovel, nascimento, sexo, estado_civil,
       morada, codigo_postal, entrada, batizado, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [nome, email, telemovel, nascimento, sexo, estado_civil,
     morada, codigo_postal, entrada, batizado, estado],
    (err) => {
      if (err) {
        // CORRIGIDO: era res.status(500).json(err) — expunha o objeto de
        // erro MySQL ao cliente (query, nome das colunas, stack trace, etc.)
        console.error("[createMember]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.status(201).json({ message: "Membro criado com sucesso" });
    }
  );
};

export const getMembers = (req, res) => {

  db.query(
    "SELECT * FROM membros ORDER BY id DESC",
    (err, result) => {
      if (err) {
        console.error("[getMembers]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.json(result);
    }
  );
};

export const updateMember = (req, res) => {

  const { id } = req.params;

  const {
    nome, email, telemovel, nascimento, sexo,
    estado_civil, morada, codigo_postal,
    entrada, batizado, estado
  } = req.body;

  const sql = `
    UPDATE membros
    SET
      nome=?, email=?, telemovel=?, nascimento=?, sexo=?,
      estado_civil=?, morada=?, codigo_postal=?,
      entrada=?, batizado=?, estado=?
    WHERE id=?
  `;

  db.query(
    sql,
    [nome, email, telemovel, nascimento, sexo, estado_civil,
     morada, codigo_postal, entrada, batizado, estado, id],
    (err) => {
      if (err) {
        console.error("[updateMember]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.json({ message: "Membro atualizado com sucesso" });
    }
  );
};

export const deleteMember = (req, res) => {

  const { id } = req.params;

  db.query(
    "DELETE FROM membros WHERE id=?",
    [id],
    (err) => {
      if (err) {
        console.error("[deleteMember]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.json({ message: "Membro eliminado com sucesso" });
    }
  );
};