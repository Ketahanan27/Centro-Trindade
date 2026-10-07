import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
const { pool } = await import('../config/db.js');
const { escreverMovimento, getMovimentos, getResumo, getHistorico } = await import('../modules/tesouraria/tesouraria.controller.js');
const { validarMovimento } = await import('../modules/tesouraria/tesouraria.model.js');
const originalConnect = pool.connect;
const originalQuery = pool.query;
const denyQuery = async () => { throw new Error('Unexpected database access'); };
pool.query = denyQuery;
afterEach(() => { pool.query = denyQuery; });
after(async () => { pool.connect = originalConnect; pool.query = originalQuery; await pool.end(); });
const valido = () => ({ natureza: 'Receita', tipo: 'Oferta', valor: '12.50', data: '2026-10-05', motivo: 'Correção confirmada' });
const snapshot = { id: 3, ...valido(), criado_por: 8 };
function resposta() { return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }
function mockClient({ failAudit = false, missing = false, missingAuthor = false, failWrite = false } = {}) {
  const calls = [];
  const client = { release() { calls.push(['RELEASE']); }, async query(sql, params) {
    calls.push([sql, params]);
    if (sql.startsWith('SELECT nome')) return { rows: missingAuthor ? [] : [{ nome: 'Autor confirmado' }] };
    if (sql.startsWith('SELECT *')) return { rows: missing ? [] : [snapshot] };
    if (sql.startsWith('INSERT INTO tesouraria_historico') && failAudit) throw new Error('Audit unavailable');
    if (sql.startsWith('UPDATE tesouraria') && failWrite) throw new Error('Write unavailable');
    return { rows: [snapshot] };
  } };
  pool.connect = async () => client;
  return calls;
}
test('rejects invalid money, impossible dates and malformed observations', () => {
  for (const valor of ['NaN', 'Infinity', '-1', '0', '0.001', '1e3', true, {}, '100000000']) assert.ok(validarMovimento({ ...valido(), valor }));
  for (const data of ['2026-02-30', '2025-02-29', '2026-13-01', '12/03/2026']) assert.ok(validarMovimento({ ...valido(), data }));
  assert.ok(validarMovimento({ ...valido(), observacao: {} }));
  for (const natureza of ['__proto__', 'constructor', {}, null]) assert.ok(validarMovimento({ ...valido(), natureza }));
  assert.equal(validarMovimento(valido()), null);
});
for (const acao of ['Criado', 'Alterado', 'Eliminado']) test(`${acao}: mutation and author snapshots commit together`, async () => {
  const calls = mockClient(); const res = resposta();
  await escreverMovimento(acao)({ body: { ...valido(), criado_por: 999 }, params: { id: 3 }, user: { id: 8 } }, res);
  assert.equal(res.code, acao === 'Criado' ? 201 : 200);
  const audit = calls.find(([sql]) => sql.startsWith('INSERT INTO tesouraria_historico'));
  assert.equal(audit[1][2], 8);
  assert.equal(audit[1][3], 'Autor confirmado');
  assert.equal(audit[1][5] === null, acao === 'Criado');
  assert.equal(audit[1][6] === null, acao === 'Eliminado');
  assert.ok(calls.find(([sql]) => sql === 'COMMIT'));
  if (acao !== 'Criado') assert.ok(calls.find(([sql]) => sql.includes('FOR UPDATE')));
});
test('audit failure rolls back financial changes', async () => {
  const calls = mockClient({ failAudit: true }); const res = resposta();
  await escreverMovimento('Alterado')({ body: valido(), params: { id: 3 }, user: { id: 8 } }, res);
  assert.equal(res.code, 500);
  assert.ok(calls.find(([sql]) => sql === 'ROLLBACK'));
  assert.ok(!calls.find(([sql]) => sql === 'COMMIT'));
  assert.equal(calls.at(-1)[0], 'RELEASE');
});
test('missing movement returns 404 without creating history', async () => {
  const calls = mockClient({ missing: true }); const res = resposta();
  await escreverMovimento('Eliminado')({ body: valido(), params: { id: 3 }, user: { id: 8 } }, res);
  assert.equal(res.code, 404);
  assert.ok(!calls.find(([sql]) => sql.startsWith('INSERT INTO tesouraria_historico')));
});
test('missing reason is refused before opening a connection', async () => {
  pool.connect = () => { throw new Error('Unexpected connection'); }; const res = resposta();
  await escreverMovimento('Eliminado')({ body: {}, params: { id: 3 }, user: { id: 8 } }, res);
  assert.equal(res.code, 400);
});

test('missing authenticated author rolls back before writing any movement', async () => {
  const calls = mockClient({ missingAuthor: true });
  const res = resposta();
  await escreverMovimento('Criado')({ body: valido(), user: { id: 8 } }, res);
  assert.equal(res.code, 500);
  assert.ok(calls.some(([sql]) => sql === 'ROLLBACK'));
  assert.ok(!calls.some(([sql]) => sql.startsWith('INSERT INTO tesouraria')));
  assert.equal(calls.at(-1)[0], 'RELEASE');
});

test('financial write failure releases the connection and does not create history', async () => {
  const calls = mockClient({ failWrite: true });
  const res = resposta();
  await escreverMovimento('Alterado')({ body: valido(), params: { id: 3 }, user: { id: 8 } }, res);
  assert.equal(res.code, 500);
  assert.ok(calls.some(([sql]) => sql === 'ROLLBACK'));
  assert.ok(!calls.some(([sql]) => sql.startsWith('INSERT INTO tesouraria_historico') || sql === 'COMMIT'));
  assert.equal(calls.at(-1)[0], 'RELEASE');
});

test('invalid movement ID is refused before a transaction starts', async () => {
  pool.connect = () => { throw new Error('Unexpected connection'); };
  const res = resposta();
  await escreverMovimento('Alterado')({ body: valido(), params: { id: 'abc' }, user: { id: 8 } }, res);
  assert.equal(res.code, 400);
  assert.equal(res.body.message, 'Movimento inválido.');
});

test('movement list keeps registration and last-operation authors in the SQL', async () => {
  pool.query = async sql => {
    assert.match(sql, /COALESCE\(registo.autor_nome, u.nome\) AS autor_registo/);
    assert.match(sql, /ultima.autor_nome AS autor_ultima_operacao/);
    assert.match(sql, /ORDER BY t.data DESC, t.id DESC/);
    return { command: 'SELECT', rows: [{ id: 3, autor_registo: 'Secretaria' }] };
  };
  const res = resposta();
  await getMovimentos({}, res);
  assert.equal(res.body[0].autor_registo, 'Secretaria');
});

test('monthly summary converts database decimals and preserves its month and year filters', async () => {
  pool.query = async sql => {
    assert.match(sql, /EXTRACT\(MONTH FROM data\)/);
    assert.match(sql, /EXTRACT\(YEAR FROM data\)/);
    return { command: 'SELECT', rows: [{ natureza: 'Receita', total: '100.50' }, { natureza: 'Despesa', total: '25.25' }] };
  };
  const res = resposta();
  await getResumo({}, res);
  assert.deepEqual(res.body, { receitas: 100.5, despesas: 25.25, saldo: 75.25 });
});

test('audit consultation preserves snapshots and the latest-200 limit', async () => {
  pool.query = async sql => {
    assert.match(sql, /ORDER BY id DESC LIMIT 200/);
    return { rows: [{ movimento_id: 3, acao: 'Eliminado', antes: snapshot, depois: null }] };
  };
  const res = resposta();
  await getHistorico({}, res);
  assert.equal(res.body[0].antes, snapshot);
  assert.equal(res.body[0].depois, null);
});
