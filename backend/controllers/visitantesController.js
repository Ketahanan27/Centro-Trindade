import db from "../config/db.js";

export const getVisitantes = (req, res) => {
  db.query("SELECT * FROM visitantes ORDER BY data_visita DESC", (err, result) => {
    if (err) {
      console.error("[getVisitantes]", err);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
    res.json(result);
  });
};

export const createVisitante = (req, res) => {
  const {
    nome, telefone, email, data_visita,
    convidado_por, observacoes, estado,
  } = req.body;

  if (!nome?.trim()) {
    return res.status(400).json({ message: "Nome obrigatório." });
  }
  if (!/^\d{9}$/.test(telefone)) {
    return res.status(400).json({ message: "O telefone deve conter exatamente 9 dígitos." });
  }
  if (!data_visita) {
    return res.status(400).json({ message: "Data da visita obrigatória." });
  }
  if (!convidado_por?.trim()) {
    return res.status(400).json({ message: "Convidado por é obrigatório." });
  }

  const sql = `
    INSERT INTO visitantes
      (nome, telefone, email, data_visita, convidado_por, observacoes, estado)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;

  db.query(
    sql,
    [nome, telefone, email, data_visita, convidado_por, observacoes, estado],
    (err) => {
      if (err) {
        console.error("[createVisitante]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.status(201).json({ message: "Visitante registado com sucesso" });
    }
  );
};

export const updateVisitante = (req, res) => {
  const { id } = req.params;
  const {
    nome, telefone, email, data_visita,
    convidado_por, observacoes, estado,
  } = req.body;

  if (!nome?.trim()) {
    return res.status(400).json({ message: "Nome obrigatório." });
  }
  if (!/^\d{9}$/.test(telefone)) {
    return res.status(400).json({ message: "O telefone deve conter exatamente 9 dígitos." });
  }
  if (!data_visita) {
    return res.status(400).json({ message: "Data da visita obrigatória." });
  }
  if (!convidado_por?.trim()) {
    return res.status(400).json({ message: "Convidado por é obrigatório." });
  }

  const sql = `
    UPDATE visitantes
    SET
      nome=$1, telefone=$2, email=$3, data_visita=$4,
      convidado_por=$5, observacoes=$6, estado=$7
    WHERE id=$8
  `;

  db.query(
    sql,
    [nome, telefone, email, data_visita, convidado_por, observacoes, estado, id],
    (err) => {
      if (err) {
        console.error("[updateVisitante]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.json({ message: "Visitante atualizado com sucesso" });
    }
  );
};

export const deleteVisitante = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM visitantes WHERE id = $1", [id], (err) => {
    if (err) {
      console.error("[deleteVisitante]", err);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
    res.json({ message: "Visitante eliminado com sucesso" });
  });
};
