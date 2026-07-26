import db from "../config/db.js";

export const getAtas = (req, res) => {
  db.query(
    `SELECT
       id,
       titulo,
       DATE_FORMAT(data, '%Y-%m-%d') AS data,
       TIME_FORMAT(hora, '%H:%i')    AS hora,
       local,
       participantes,
       resumo,
       decisoes,
       observacoes,
       created_at
     FROM atas
     ORDER BY data ASC, hora ASC`,
    (err, result) => {
      if (err) {
        console.error("[getAtas]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.json(result);
    }
  );
};

export const createAta = (req, res) => {
  const {
    titulo, data, hora, local,
    participantes, resumo, decisoes, observacoes,
  } = req.body;

  if (!titulo?.trim()) {
    return res.status(400).json({ message: "O título é obrigatório." });
  }
  if (!data) {
    return res.status(400).json({ message: "A data é obrigatória." });
  }
  if (!hora) {
    return res.status(400).json({ message: "A hora é obrigatória." });
  }

  const sql = `
    INSERT INTO atas
      (titulo, data, hora, local, participantes, resumo, decisoes, observacoes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      titulo.trim(),
      data,
      hora,
      local || null,
      participantes || null,
      resumo || null,
      decisoes || null,
      observacoes || null,
    ],
    (err, result) => {
      if (err) {
        console.error("[createAta]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.status(201).json({
        message: "Reunião registada com sucesso.",
        id: result.insertId,
      });
    }
  );
};

export const updateAta = (req, res) => {
  const { id } = req.params;
  const {
    titulo, data, hora, local,
    participantes, resumo, decisoes, observacoes,
  } = req.body;

  if (!titulo?.trim()) {
    return res.status(400).json({ message: "O título é obrigatório." });
  }
  if (!data) {
    return res.status(400).json({ message: "A data é obrigatória." });
  }
  if (!hora) {
    return res.status(400).json({ message: "A hora é obrigatória." });
  }

  const sql = `
    UPDATE atas
    SET
      titulo=?, data=?, hora=?, local=?,
      participantes=?, resumo=?, decisoes=?, observacoes=?
    WHERE id=?
  `;

  db.query(
    sql,
    [
      titulo.trim(),
      data,
      hora,
      local || null,
      participantes || null,
      resumo || null,
      decisoes || null,
      observacoes || null,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("[updateAta]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Reunião não encontrada." });
      }
      res.json({ message: "Reunião atualizada com sucesso." });
    }
  );
};

export const deleteAta = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM atas WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("[deleteAta]", err);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reunião não encontrada." });
    }
    res.json({ message: "Reunião eliminada com sucesso." });
  });
};
