import assert from 'node:assert/strict';
import { after, test } from 'node:test';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
const { pool } = await import('../config/db.js');
const { escreverMovimento, validarMovimento } = await import('../controllers/tesourariaEscrita.js');
const originalConnect = pool.connect;
after(async () => { pool.connect = originalConnect; await pool.end(); });
const valido = () => ({ natureza: 'Receita', tipo: 'Oferta', valor: '12.50', data: '2026-10-05', motivo: 'Correção confirmada' });
const snapshot = { id: 3, ...valido(), criado_por: 8 };
function resposta() { return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }
function mockClient({ failAudit = false, missing = false } = {}) {
  const calls = [];
  const client = { release() { calls.push(['RELEASE']); }, async query(sql, params) {
    calls.push([sql, params]);
    if (sql.startsWith('SELECT nome')) return { rows: [{ nome: 'Autor confirmado' }] };
    if (sql.startsWith('SELECT *')) return { rows: missing ? [] : [snapshot] };
    if (sql.startsWith('INSERT INTO tesouraria_historico') && failAudit) throw new Error('Audit unavailable');
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
