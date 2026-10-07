import db from '../../config/db.js';
export const relatoriosRepository = {
  membrosEstado: (params = []) => db.query(`SELECT estado, COUNT(*) AS total
         FROM membros
         GROUP BY estado
         ORDER BY total DESC`, params),
  visitantesEstado: (params = []) => db.query(`SELECT estado, COUNT(*) AS total
         FROM visitantes
         GROUP BY estado
         ORDER BY total DESC`, params),
  financeiroMensal: (params = []) => db.query(`SELECT
               EXTRACT(MONTH FROM data)  AS mes,
               ROUND(SUM(CASE WHEN natureza = 'Receita' THEN valor ELSE 0 END), 2) AS receitas,
               ROUND(SUM(CASE WHEN natureza = 'Despesa' THEN valor ELSE 0 END), 2) AS despesas
             FROM tesouraria
             WHERE EXTRACT(YEAR FROM data) = $1
             GROUP BY EXTRACT(MONTH FROM data)
             ORDER BY mes`, params),
  eventosMes: (params = []) => db.query(`SELECT
           EXTRACT(MONTH FROM data_evento) AS mes,
           COUNT(*)           AS total
         FROM eventos
         WHERE EXTRACT(YEAR FROM data_evento) = $1
         GROUP BY EXTRACT(MONTH FROM data_evento)
         ORDER BY mes`, params),
  apresentacoesMes: (params = []) => db.query(`SELECT
           EXTRACT(MONTH FROM data_apresentacao) AS mes,
           SUM(quantidade)          AS criancas,
           COUNT(*)                 AS sessoes
         FROM apresentacoes
         WHERE EXTRACT(YEAR FROM data_apresentacao) = $1
         GROUP BY EXTRACT(MONTH FROM data_apresentacao)
         ORDER BY mes`, params),
  geral: (params = [], podeVerFinancas = false) => db.query(`SELECT
           (SELECT COUNT(*)               FROM membros      WHERE estado = 'Ativo')              AS membros_ativos,
           (SELECT COUNT(*)               FROM membros)                                           AS membros_total,
           (SELECT COUNT(*)               FROM visitantes)                                        AS visitantes_total,
           (SELECT COUNT(*)               FROM visitantes   WHERE estado = 'Tornou-se membro')    AS convertidos,
           (SELECT COUNT(*)               FROM apresentacoes WHERE EXTRACT(YEAR FROM data_apresentacao) = $1)   AS apresentacoes_ano,
           (SELECT COALESCE(SUM(quantidade),0) FROM apresentacoes WHERE EXTRACT(YEAR FROM data_apresentacao) = $2) AS criancas_ano,
           (SELECT COUNT(*)               FROM eventos WHERE data_evento >= CURRENT_DATE AND estado = 'Agendado') AS proximos_eventos,
           ${podeVerFinancas ? "(SELECT ROUND(COALESCE(SUM(valor),0),2) FROM tesouraria WHERE natureza = 'Receita' AND EXTRACT(YEAR FROM data) = $3)" : 'NULL::numeric'} AS receitas_ano,
           ${podeVerFinancas ? "(SELECT ROUND(COALESCE(SUM(valor),0),2) FROM tesouraria WHERE natureza = 'Despesa' AND EXTRACT(YEAR FROM data) = $4)" : 'NULL::numeric'} AS despesas_ano`, params)
};
