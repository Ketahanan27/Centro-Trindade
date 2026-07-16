import db from "../config/db.js";

export const createEvent = (req, res) => {
  const {
    titulo,
    descricao,
    data_evento,
    hora_evento,
    local_evento,
    estado
  } = req.body;
  if (!titulo?.trim()) {
    return res.status(400).json({ message: "O título é obrigatório." });
  }

  if (!data_evento) {
    return res.status(400).json({ message: "A data é obrigatória." });
  }
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataEvento = new Date(data_evento);
  dataEvento.setHours(0, 0, 0, 0);
  if (dataEvento < hoje) {
    return res.status(400).json({
      message: "Não é permitido criar eventos em datas passadas."
    });
  }
  const sql = `
    INSERT INTO eventos
      (titulo, descricao, data_evento, hora_evento, local_evento, estado)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [titulo, descricao, data_evento, hora_evento, local_evento, estado],
    (err) => {
      if (err) {
        console.error("[createEvent]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.status(201).json({ message: "Evento criado com sucesso" });
    }
  );
};

export const getEvents = (req, res) => {

  const sql = `
    SELECT
      id,
      titulo,
      descricao,
      DATE_FORMAT(data_evento, '%Y-%m-%d') AS data_evento,
      hora_evento,
      local_evento,
      estado
    FROM eventos
    ORDER BY data_evento ASC, hora_evento ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("[getEvents]", err);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
    res.json(result);
  });
};

export const updateEvent = (req, res) => {

  const { id } = req.params;

  const {
    titulo,
    descricao,
    data_evento,
    hora_evento,
    local_evento,
    estado
  } = req.body;

  if (!titulo?.trim()) {
    return res.status(400).json({ message: "O título é obrigatório." });
  }

  if (!data_evento) {
    return res.status(400).json({ message: "A data é obrigatória." });
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataEvento = new Date(data_evento);
  dataEvento.setHours(0, 0, 0, 0);

  if (dataEvento < hoje) {
    return res.status(400).json({
      message: "Não é permitido alterar eventos passados."
    });
  }

  const sql = `
    UPDATE eventos
    SET
      titulo=?, descricao=?, data_evento=?,
      hora_evento=?, local_evento=?, estado=?
    WHERE id=?
  `;

  db.query(
    sql,
    [titulo, descricao, data_evento, hora_evento, local_evento, estado, id],
    (err) => {
      if (err) {
        console.error("[updateEvent]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.json({ message: "Evento atualizado com sucesso" });
    }
  );
};

export const deleteEvent = (req, res) => {

  const { id } = req.params;

  db.query(
    "SELECT data_evento FROM eventos WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("[deleteEvent select]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Evento não encontrado." });
      }

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const dataEvento = new Date(result[0].data_evento);

      if (dataEvento < hoje) {
        return res.status(400).json({
          message: "Eventos já realizados não podem ser eliminados."
        });
      }

      db.query(
        "DELETE FROM eventos WHERE id = ?",
        [id],
        (err) => {
          if (err) {
            console.error("[deleteEvent delete]", err);
            return res.status(500).json({ message: "Erro interno do servidor." });
          }
          res.json({ message: "Evento eliminado com sucesso" });
        }
      );
    }
  );
};
