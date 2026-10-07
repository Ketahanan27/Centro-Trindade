import db from '../../config/db.js';

const FILTROS = `WHERE ($1::date IS NULL OR data_atividade >= $1::date)
  AND ($2::date IS NULL OR data_atividade <= $2::date)
  AND ($3::text IS NULL OR atividade ILIKE $3)`;
const parametros = filtros => [filtros.inicio, filtros.fim, filtros.pesquisa];
const valores = (dados, autorId) => [
  dados.evento_id, dados.atividade, dados.data_atividade, dados.quantidade, dados.observacoes, autorId,
];

export const visitasAtividadeRepository = {
  resumir: filtros => db.query(`SELECT COUNT(*) AS total,COALESCE(SUM(quantidade),0) AS visitantes FROM visitas_atividade ${FILTROS}`, parametros(filtros)),
  listar: filtros => db.query(
    `SELECT id,evento_id,atividade,TO_CHAR(data_atividade,'YYYY-MM-DD') AS data_atividade,quantidade,observacoes
     FROM visitas_atividade ${FILTROS} ORDER BY data_atividade DESC,id DESC LIMIT $4 OFFSET $5`,
    [...parametros(filtros), filtros.limite, filtros.offset],
  ),
  obterEvento: id => db.query("SELECT titulo,TO_CHAR(data_evento,'YYYY-MM-DD') AS data FROM eventos WHERE id=$1", [id]),
  criar: (dados, autorId) => db.query(
    `INSERT INTO visitas_atividade(evento_id,atividade,data_atividade,quantidade,observacoes,criado_por,atualizado_por)
     VALUES($1,$2,$3,$4,$5,$6,$6) RETURNING id`, valores(dados, autorId),
  ),
  atualizar: (id, dados, autorId) => db.query(
    `UPDATE visitas_atividade SET evento_id=$1,atividade=$2,data_atividade=$3,quantidade=$4,
     observacoes=$5,atualizado_por=$6,atualizado_em=now() WHERE id=$7 RETURNING id`,
    [...valores(dados, autorId), id],
  ),
  eliminar: id => db.query('DELETE FROM visitas_atividade WHERE id=$1', [id]),
};
