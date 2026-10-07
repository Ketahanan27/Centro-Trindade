import { pool } from '../../config/db.js';
import { LIMITE_GLOBAL } from './relatorio-global.model.js';
const consultas = {
  'membros': {
    resumo: `SELECT COUNT(*) AS entradas FROM membros WHERE entrada BETWEEN $1::date AND $2::date`,
    detalhe: `SELECT nome, entrada AS data, estado, batizado FROM membros WHERE entrada BETWEEN $1::date AND $2::date ORDER BY entrada, id`
  },
  'participacoes': {
    resumo: `SELECT COUNT(*) AS atividades, COALESCE(SUM(quantidade),0) AS participacoes FROM visitas_atividade WHERE data_atividade BETWEEN $1::date AND $2::date`,
    detalhe: `SELECT atividade, data_atividade AS data, quantidade, observacoes FROM visitas_atividade WHERE data_atividade BETWEEN $1::date AND $2::date ORDER BY data_atividade, id`
  },
  'acompanhamento': {
    resumo: `SELECT COUNT(*) AS visitas_registadas FROM visitantes WHERE data_visita BETWEEN $1::date AND $2::date`,
    detalhe: `SELECT nome, data_visita AS data, estado FROM visitantes WHERE data_visita BETWEEN $1::date AND $2::date ORDER BY data_visita, id`
  },
  'agenda': {
    resumo: `SELECT COUNT(*) AS eventos, COUNT(*) FILTER (WHERE estado='Agendado') AS agendados, COUNT(*) FILTER (WHERE estado='Concluído') AS concluidos, COUNT(*) FILTER (WHERE estado='Cancelado') AS cancelados, COUNT(*) FILTER (WHERE publico) AS publicos FROM eventos WHERE data_evento BETWEEN $1::date AND $2::date`,
    detalhe: `SELECT titulo, data_evento AS data, TO_CHAR(hora_evento,'HH24:MI') AS hora, local_evento AS local, estado, CASE WHEN publico THEN 'Público' ELSE 'Interno' END AS visibilidade FROM eventos WHERE data_evento BETWEEN $1::date AND $2::date ORDER BY data_evento, id`
  },
  'apresentacoes': {
    resumo: `SELECT COUNT(*) AS sessoes, COALESCE(SUM(quantidade),0) AS criancas FROM apresentacoes WHERE data_apresentacao BETWEEN $1::date AND $2::date`,
    detalhe: `SELECT data_apresentacao AS data, quantidade, observacoes FROM apresentacoes WHERE data_apresentacao BETWEEN $1::date AND $2::date ORDER BY data_apresentacao, id`
  },
  'documentos': {
    resumo: `SELECT COUNT(*) AS documentos FROM documentos WHERE data_emissao BETWEEN $1::date AND $2::date`,
    detalhe: `SELECT tipo, nome_completo, data_emissao AS data FROM documentos WHERE data_emissao BETWEEN $1::date AND $2::date ORDER BY data_emissao, id`
  },
  'atas': {
    resumo: `SELECT COUNT(*) AS reunioes FROM atas WHERE data BETWEEN $1::date AND $2::date`,
    detalhe: `SELECT titulo, data, hora, local, participantes, resumo, decisoes, observacoes FROM atas WHERE data BETWEEN $1::date AND $2::date ORDER BY data, id`
  },
  'tesouraria': {
    resumo: `SELECT COUNT(*) AS movimentos, COALESCE(SUM(valor) FILTER (WHERE natureza='Receita'),0) AS receitas, COALESCE(SUM(valor) FILTER (WHERE natureza='Despesa'),0) AS despesas, COALESCE(SUM(CASE WHEN natureza='Receita' THEN valor ELSE -valor END),0) AS saldo FROM tesouraria WHERE data BETWEEN $1::date AND $2::date`,
    detalhe: `SELECT data, natureza, tipo, valor, observacao FROM tesouraria WHERE data BETWEEN $1::date AND $2::date ORDER BY data, id`
  }
};
export const relatorioGlobalRepository = {
  async comLeituraConsistente(executar) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const query = async (sql, params = []) => (await client.query(sql, params)).rows;
      const leitura = {
        resumirSecao: (chave, periodo) => query(consultas[chave].resumo, periodo),
        listarSecao: (chave, periodo) => query(consultas[chave].detalhe + ' LIMIT ' + (LIMITE_GLOBAL + 1), periodo),
        estadosMembros: (params = []) => query(`SELECT estado, COUNT(*) AS total FROM membros GROUP BY estado ORDER BY estado`, params),
        batizados: (params = []) => query(`SELECT COUNT(*) AS total FROM membros WHERE batizado = 'Sim'`, params),
        estadosVisitantes: (params = []) => query(`SELECT estado, COUNT(*) AS total FROM visitantes GROUP BY estado ORDER BY estado`, params),
        financeiroMensal: (params = []) => query(`SELECT TO_CHAR(data,'YYYY-MM') AS mes, COALESCE(SUM(valor) FILTER (WHERE natureza='Receita'),0) AS receitas, COALESCE(SUM(valor) FILTER (WHERE natureza='Despesa'),0) AS despesas FROM tesouraria WHERE data BETWEEN $1::date AND $2::date GROUP BY TO_CHAR(data,'YYYY-MM') ORDER BY mes`, params)
      };
      const resultado = await executar(leitura);
      await client.query('COMMIT');
      return resultado;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
};
