import db from "../config/db.js";

export const getApresentacoes = (req, res) => {
  db.query("SELECT * FROM apresentacoes ORDER BY data_apresentacao DESC", (err, result) => {
    if (err) {
      console.error("[getApresentacoes]", err);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
    res.json(result);
  });
};

export const createApresentacao = (req, res) => {
  const { data_apresentacao, quantidade, observacoes } = req.body;

  if (!data_apresentacao) {
    return res.status(400).json({ message: "Data obrigatória." });
  }
  if (!quantidade || Number(quantidade) <= 0) {
    return res.status(400).json({ message: "Quantidade inválida." });
  }

  db.query(
    `INSERT INTO apresentacoes (data_apresentacao, quantidade, observacoes)
     VALUES (?, ?, ?)`,
    [data_apresentacao, quantidade, observacoes],
    (err) => {
      if (err) {
        console.error("[createApresentacao]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.status(201).json({ message: "Apresentação registada com sucesso" });
    }
  );
};

export const updateApresentacao = (req, res) => {
  const { id } = req.params;
  const { data_apresentacao, quantidade, observacoes } = req.body;

  if (!data_apresentacao) {
    return res.status(400).json({ message: "Data obrigatória." });
  }
  if (!quantidade || Number(quantidade) <= 0) {
    return res.status(400).json({ message: "Quantidade inválida." });
  }

  db.query(
    `UPDATE apresentacoes
     SET data_apresentacao=?, quantidade=?, observacoes=?
     WHERE id=?`,
    [data_apresentacao, quantidade, observacoes, id],
    (err) => {
      if (err) {
        console.error("[updateApresentacao]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.json({ message: "Apresentação atualizada com sucesso" });
    }
  );
};

export const deleteApresentacao = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM apresentacoes WHERE id=?", [id], (err) => {
    if (err) {
      console.error("[deleteApresentacao]", err);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
    res.json({ message: "Apresentação eliminada com sucesso" });
  });
};
