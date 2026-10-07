import db, { pool } from '../../config/db.js';

const SQL_MOVIMENTOS = `
    SELECT
      t.id,
      t.natureza,
      t.tipo,
      t.valor,
      TO_CHAR(t.data, 'YYYY-MM-DD') AS data,
      t.observacao,
      t.created_at,
      COALESCE(registo.autor_nome, u.nome) AS autor_registo,
      ultima.autor_nome AS autor_ultima_operacao,
      ultima.acao AS ultima_operacao
    FROM tesouraria t
    LEFT JOIN utilizadores u ON u.id = t.criado_por
    LEFT JOIN LATERAL (
      SELECT autor_nome FROM tesouraria_historico
      WHERE movimento_id = t.id AND acao = 'Criado' ORDER BY id ASC LIMIT 1
    ) registo ON true
    LEFT JOIN LATERAL (
      SELECT autor_nome, acao FROM tesouraria_historico
      WHERE movimento_id = t.id ORDER BY id DESC LIMIT 1
    ) ultima ON true
    ORDER BY t.data DESC, t.id DESC
  `;
const SQL_RESUMO = `
    SELECT
      natureza,
      SUM(valor)  AS total,
      COUNT(*)    AS quantidade
    FROM tesouraria
    WHERE EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM data)  = EXTRACT(YEAR FROM CURRENT_DATE)
    GROUP BY natureza
  `;

function repositorioDaTransacao(client) {
  return {
    async obterAutor(id) {
      const resultado = await client.query('SELECT nome FROM utilizadores WHERE id = $1', [id]);
      return resultado.rows[0] ?? null;
    },
    async bloquearMovimento(id) {
      const resultado = await client.query('SELECT * FROM tesouraria WHERE id = $1 FOR UPDATE', [id]);
      return resultado.rows[0] ?? null;
    },
    async escrever(acao, id, dados, autorId) {
      const params = [dados.natureza, dados.tipo, String(dados.valor), dados.data, dados.observacao?.trim() || null];
      let resultado;
      if (acao === 'Criado') resultado = await client.query('INSERT INTO tesouraria (natureza, tipo, valor, data, observacao, criado_por) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [...params, autorId]);
      else if (acao === 'Alterado') resultado = await client.query('UPDATE tesouraria SET natureza=$1, tipo=$2, valor=$3, data=$4, observacao=$5 WHERE id=$6 RETURNING *', [...params, id]);
      else resultado = await client.query('DELETE FROM tesouraria WHERE id=$1 RETURNING *', [id]);
      return resultado.rows[0];
    },
    registarHistorico({ id, acao, autorId, autorNome, motivo, antes, depois }) {
      return client.query('INSERT INTO tesouraria_historico (movimento_id, acao, autor_id, autor_nome, motivo, antes, depois) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb)', [id, acao, autorId, autorNome, motivo, antes ? JSON.stringify(antes) : null, depois ? JSON.stringify(depois) : null]);
    },
  };
}

export const tesourariaRepository = {
  listarMovimentos: () => db.query(SQL_MOVIMENTOS),
  obterResumo: () => db.query(SQL_RESUMO),
  async listarHistorico() {
    const resultado = await pool.query('SELECT id, movimento_id, acao, autor_nome, motivo, antes, depois, registado_em FROM tesouraria_historico ORDER BY id DESC LIMIT 200');
    return resultado.rows;
  },
  async comTransacao(operacao) {
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const resultado = await operacao(repositorioDaTransacao(client));
      await client.query('COMMIT');
      return resultado;
    } catch (error) {
      if (client) await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client?.release();
    }
  },
};
