import db from '../../config/db.js';
export const dashboardRepository = {
  membrosAtivos: (params = []) => db.query("SELECT COUNT(*) AS total FROM membros WHERE estado='Ativo'", params),
  novosMembros: (params = []) => db.query('SELECT COUNT(*) AS total FROM membros WHERE entrada >= $1::date AND entrada < $2::date', params),
  visitantes: (params = []) => db.query('SELECT COALESCE(SUM(quantidade),0) AS total FROM visitas_atividade', params),
  proximosEventos: (params = []) => db.query(`SELECT id,titulo,TO_CHAR(data_evento,'YYYY-MM-DD') AS data,hora_evento,local_evento,publico,estado,
         COUNT(*) FILTER (WHERE estado='Agendado') OVER() AS total FROM eventos WHERE data_evento >= $1::date
         AND ($2::boolean OR (publico=true AND estado='Agendado')) ORDER BY data_evento,hora_evento NULLS LAST,id LIMIT 4`, params),
  visitantesAtividade: (params = []) => db.query(`SELECT id,atividade,TO_CHAR(data_atividade,'YYYY-MM-DD') AS data,quantidade FROM visitas_atividade WHERE data_atividade >= $1::date AND data_atividade < $2::date ORDER BY data_atividade DESC,id DESC LIMIT 8`, params),
  visitantesPorEstado: (params = []) => db.query('SELECT estado,COUNT(*) AS total FROM visitantes GROUP BY estado ORDER BY estado', params),
  financeiroMensal: (params = []) => db.query("SELECT COALESCE(SUM(valor) FILTER (WHERE natureza='Receita'),0) AS receitas,COALESCE(SUM(valor) FILTER (WHERE natureza='Despesa'),0) AS despesas FROM tesouraria WHERE data >= $1::date AND data < $2::date", params),
  financeiroAnual: (params = []) => db.query("SELECT EXTRACT(MONTH FROM data)::integer AS mes,COALESCE(SUM(valor) FILTER (WHERE natureza='Receita'),0) AS receitas,COALESCE(SUM(valor) FILTER (WHERE natureza='Despesa'),0) AS despesas FROM tesouraria WHERE data >= $1::date AND data < $2::date GROUP BY 1 ORDER BY 1", params),
  membrosSemConta: (params = []) => db.query('SELECT COUNT(*) AS total FROM membros WHERE utilizador_id IS NULL', params),
  convitesPendentes: (params = []) => db.query("SELECT COUNT(*) AS total FROM utilizadores WHERE convite_pendente=true AND estado='Ativo'", params)
};
