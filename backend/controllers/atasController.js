import db from "../config/db.js";

export const getAtas = (req, res) => {
  db.query(
    `SELECT
       id,
       titulo,
       TO_CHAR(data, 'YYYY-MM-DD') AS data,
       TO_CHAR(DATE '2000-01-01' + hora, 'HH24:MI')    AS hora,
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
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;

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
        id: result.rows[0].id,
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
      titulo=$1, data=$2, hora=$3, local=$4,
      participantes=$5, resumo=$6, decisoes=$7, observacoes=$8
    WHERE id=$9
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
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Reunião não encontrada." });
      }
      res.json({ message: "Reunião atualizada com sucesso." });
    }
  );
};

export const deleteAta = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM atas WHERE id = $1", [id], (err, result) => {
    if (err) {
      console.error("[deleteAta]", err);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Reunião não encontrada." });
    }
    res.json({ message: "Reunião eliminada com sucesso." });
  });
};
