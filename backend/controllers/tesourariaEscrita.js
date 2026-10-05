import { pool } from '../config/db.js';

const TIPOS = {
  Receita: ['Dízimo', 'Oferta', 'Voto', 'Contribuição', 'Doação', 'Ação Social', 'T-Shirts', 'Outros'],
  Despesa: ['Água', 'Luz', 'Internet', 'Manutenção', 'Compras', 'Caixa', 'Outros'],
};

export function validarMovimento(body) {
  if (!body || typeof body.natureza !== 'string' || !Object.hasOwn(TIPOS, body.natureza) || !TIPOS[body.natureza].includes(body.tipo)) return 'Natureza ou tipo inválido.';
  if (!['number', 'string'].includes(typeof body.valor) || !/^\d+(\.\d{1,2})?$/.test(String(body.valor)) || !Number.isFinite(Number(body.valor)) || Number(body.valor) <= 0 || Number(body.valor) > 99999999.99) return 'O valor deve ser positivo, até 99 999 999,99 €, com no máximo duas casas decimais.';
  if (typeof body.data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.data) || body.data.slice(0, 4) < '1900') return 'Data inválida.';
  const parsed = new Date(`${body.data}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== body.data) return 'Data inválida.';
  if (body.observacao != null && (typeof body.observacao !== 'string' || body.observacao.length > 2000)) return 'Observação inválida (máximo 2000 caracteres).';
  return null;
}

const idValido = (id) => /^\d+$/.test(String(id)) && Number.isSafeInteger(Number(id)) && Number(id) > 0 && Number(id) <= 2147483647;

export const escreverMovimento = (acao) => async (req, res) => {
  if (acao !== 'Criado' && !idValido(req.params.id)) return res.status(400).json({ message: 'Movimento inválido.' });
  const body = req.body ?? {};
  if (acao !== 'Eliminado') {
    const erro = validarMovimento(body);
    if (erro) return res.status(400).json({ message: erro });
  }
  if (acao !== 'Criado' && (typeof body.motivo !== 'string' || body.motivo.trim().length < 5 || body.motivo.length > 500)) return res.status(400).json({ message: 'Indique o motivo da operação (5 a 500 caracteres).' });
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const users = await client.query('SELECT nome FROM utilizadores WHERE id = $1', [req.user.id]);
    if (!users.rows.length) throw new Error('Autor inexistente');
    let antes = null;
    if (acao !== 'Criado') {
      const current = await client.query('SELECT * FROM tesouraria WHERE id = $1 FOR UPDATE', [req.params.id]);
      if (!current.rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Movimento não encontrado.' });
      }
      antes = current.rows[0];
    }
    const params = [body.natureza, body.tipo, String(body.valor), body.data, body.observacao?.trim() || null];
    let result;
    if (acao === 'Criado') result = await client.query('INSERT INTO tesouraria (natureza, tipo, valor, data, observacao, criado_por) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [...params, req.user.id]);
    else if (acao === 'Alterado') result = await client.query('UPDATE tesouraria SET natureza=$1, tipo=$2, valor=$3, data=$4, observacao=$5 WHERE id=$6 RETURNING *', [...params, req.params.id]);
    else result = await client.query('DELETE FROM tesouraria WHERE id=$1 RETURNING *', [req.params.id]);
    const depois = acao === 'Eliminado' ? null : result.rows[0];
    const id = result.rows[0].id;
    await client.query('INSERT INTO tesouraria_historico (movimento_id, acao, autor_id, autor_nome, motivo, antes, depois) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb)', [id, acao, req.user.id, users.rows[0].nome, acao === 'Criado' ? null : body.motivo.trim(), antes ? JSON.stringify(antes) : null, depois ? JSON.stringify(depois) : null]);
    await client.query('COMMIT');
    return res.status(acao === 'Criado' ? 201 : 200).json({ message: acao === 'Criado' ? 'Movimento registado com sucesso.' : acao === 'Alterado' ? 'Movimento atualizado com sucesso.' : 'Movimento eliminado com histórico preservado.', id });
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('[tesouraria]', error.code ?? 'erro');
    return res.status(500).json({ message: 'Não foi possível guardar a operação. Nenhuma alteração foi confirmada.' });
  } finally { client?.release(); }
};

export async function getHistorico(req, res) {
  try {
    const result = await pool.query('SELECT id, movimento_id, acao, autor_nome, motivo, antes, depois, registado_em FROM tesouraria_historico ORDER BY id DESC LIMIT 200');
    res.json(result.rows);
  } catch (error) {
    console.error('[tesourariaHistorico]', error.code ?? 'erro');
    res.status(500).json({ message: 'Não foi possível consultar o histórico.' });
  }
}
