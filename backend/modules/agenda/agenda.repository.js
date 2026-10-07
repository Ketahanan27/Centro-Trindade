import db from '../../config/db.js';

const selecionar = `SELECT id, titulo, descricao, TO_CHAR(data_evento, 'YYYY-MM-DD') AS data_evento,
  TO_CHAR(DATE '2000-01-01' + hora_evento, 'HH24:MI') AS hora_evento, local_evento, estado`;

const valoresDoEvento = dados => [
  dados.titulo, dados.descricao, dados.data_evento, dados.hora_evento,
  dados.local_evento, dados.estado, dados.publico,
];

export const agendaRepository = {
  listarPublicos() {
    return db.query(`${selecionar} FROM eventos WHERE publico = true AND estado = 'Agendado' ORDER BY data_evento, hora_evento, id`);
  },

  listarInternos() {
    return db.query(`${selecionar}, publico FROM eventos ORDER BY data_evento, hora_evento, id`);
  },

  async criar(dados) {
    const resultado = await db.query(
      `INSERT INTO eventos (titulo, descricao, data_evento, hora_evento, local_evento, estado, publico)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      valoresDoEvento(dados),
    );
    return resultado.rows[0].id;
  },

  async atualizar(id, dados) {
    const resultado = await db.query(
      `UPDATE eventos SET titulo=$1, descricao=$2, data_evento=$3, hora_evento=$4,
       local_evento=$5, estado=$6, publico=$7 WHERE id=$8`,
      [...valoresDoEvento(dados), id],
    );
    return resultado.rowCount;
  },

  async eliminarNaoRealizado(id, hoje) {
    const resultado = await db.query('DELETE FROM eventos WHERE id=$1 AND data_evento >= $2::date', [id, hoje]);
    return resultado.rowCount;
  },

  async existe(id) {
    const registos = await db.query('SELECT id FROM eventos WHERE id=$1', [id]);
    return registos.length > 0;
  },
};
