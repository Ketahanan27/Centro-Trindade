import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
const { pool } = await import('../config/db.js');
const visitantes = await import('../modules/secretaria/visitantes.controller.js');
const apresentacoes = await import('../modules/secretaria/apresentacoes.controller.js');
const atas = await import('../modules/secretaria/atas.controller.js');
const { criarSecretariaService } = await import('../modules/secretaria/secretaria.service.js');
const { criarSecretariaRepository } = await import('../modules/secretaria/secretaria.repository.js');
const originalQuery = pool.query;
const deny = async () => { throw new Error('Unexpected database access'); };
pool.query = deny;
afterEach(() => { pool.query = deny; });
after(async () => { pool.query = originalQuery; await pool.end(); });
function response() { return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }
const visit = () => ({ nome: ' Maria ', telefone: '912345678', email: ' TESTE@example.invalid ', data_visita: '2026-10-05', convidado_por: ' João ', estado: 'Visitante', observacoes: 'Primeiro parágrafo.\nSegundo parágrafo.' });
const presentation = () => ({ data_apresentacao: '2026-10-05', quantidade: '2', observacoes: 'Registo de teste' });
const minutes = () => ({ titulo: ' Reunião ', data: '2026-10-05', hora: '09:30', local: ' Sala ', participantes: 'Pessoa A\nPessoa B', resumo: 'Discussão\nConclusão', decisoes: 'Decisão', observacoes: '' });
const areas = [
  { name: 'visitantes', create: visitantes.createVisitante, update: visitantes.updateVisitante, remove: visitantes.deleteVisitante, valid: visit },
  { name: 'apresentacoes', create: apresentacoes.createApresentacao, update: apresentacoes.updateApresentacao, remove: apresentacoes.deleteApresentacao, valid: presentation },
  { name: 'atas', create: atas.createAta, update: atas.updateAta, remove: atas.deleteAta, valid: minutes },
];
for (const area of areas) {
  test(`${area.name}: service validates before accessing persistence`, async () => {
    const service = criarSecretariaService(area.name, {});
    await assert.rejects(service.criar(null), { status: 400 });
    await assert.rejects(service.atualizar('abc', area.valid()), { status: 400 });
    await assert.rejects(service.eliminar('0'), { status: 400 });
  });
  test(`${area.name}: malformed bodies and IDs return 400 before SQL`, async () => {
    for (const body of [null, [], 'texto', {}]) { const res = response(); await area.create({ body }, res); assert.equal(res.code, 400); }
    for (const id of ['0', 'abc', '2147483648', '1.5']) { const res = response(); await area.update({ params: { id }, body: area.valid() }, res); assert.equal(res.code, 400); }
  });
  test(`${area.name}: missing update and deletion return 404`, async () => {
    pool.query = async () => ({ command: 'UPDATE', rowCount: 0, rows: [] });
    for (const handler of [area.update, area.remove]) { const res = response(); await handler({ params: { id: '9' }, body: area.valid() }, res); assert.equal(res.code, 404); }
  });
  test(`${area.name}: valid creation is parameterized and returns new ID`, async () => {
    pool.query = async (sql, params) => {
      assert.match(sql, /VALUES \(\$1/); assert.equal(params.length, area.name === 'visitantes' ? 7 : area.name === 'atas' ? 8 : 3);
      if (area.name === 'visitantes') { assert.equal(params[0], 'Maria'); assert.equal(params[2], 'teste@example.invalid'); assert.match(params[5], /\n/); }
      if (area.name === 'atas') { assert.equal(params[0], 'Reunião'); assert.match(params[4], /\n/); assert.equal(params[7], null); }
      if (area.name === 'apresentacoes') assert.equal(params[1], 2);
      return { command: 'INSERT', rowCount: 1, rows: [{ id: 99 }] };
    };
    const res = response(); await area.create({ body: area.valid() }, res); assert.equal(res.code, 201); assert.equal(res.body.id, 99);
  });
}

const lists = [
  { name: 'visitantes', handler: visitantes.getVisitantes, order: /ORDER BY data_visita DESC/ },
  { name: 'apresentacoes', handler: apresentacoes.getApresentacoes, order: /ORDER BY data_apresentacao DESC/ },
  { name: 'atas', handler: atas.getAtas, order: /ORDER BY data ASC, hora ASC/ },
];
for (const area of lists) {
  test(`${area.name}: listing preserves ordering and response fields`, async () => {
    const rows = [{ id: 12, observacoes: 'Texto\ncom duas linhas' }];
    pool.query = async sql => {
      assert.match(sql, area.order);
      if (area.name === 'atas') {
        assert.match(sql, /TO_CHAR\(data, 'YYYY-MM-DD'\)/);
        assert.match(sql, /HH24:MI/);
      }
      return { command: 'SELECT', rows };
    };
    const res = response();
    await area.handler({}, res);
    assert.equal(res.code, 200);
    assert.deepEqual(res.body, rows);
  });
  test(`${area.name}: listing failure returns a generic server error`, async () => {
    pool.query = async () => { throw new Error('Detalhes privados da ligação'); };
    const res = response();
    await area.handler({}, res);
    assert.equal(res.code, 500);
    assert.deepEqual(res.body, { message: 'Erro interno do servidor.' });
  });
}

test('secretaria repository refuses unknown table definitions before executing SQL', () => {
  for (const area of ['membros', 'visitantes; DROP TABLE membros', '__proto__']) {
    assert.throws(() => criarSecretariaRepository(area), /Área da secretaria desconhecida/);
  }
});
test('visitors refuse invalid contact, state, dates and oversized names', async () => {
  for (const patch of [{ nome: {} }, { nome: 'a'.repeat(151) }, { telefone: 912345678 }, { email: 'invalid' }, { data_visita: '2026-02-30' }, { convidado_por: [] }, { estado: 'Convertido' }, { observacoes: {} }]) {
    const res = response(); await visitantes.createVisitante({ body: { ...visit(), ...patch } }, res); assert.equal(res.code, 400);
  }
});
test('presentation quantity refuses NaN, fractions, negatives, booleans and integer overflow', async () => {
  for (const quantidade of ['NaN', 'Infinity', '1.5', 0, -1, true, {}, '2147483648']) {
    const res = response(); await apresentacoes.createApresentacao({ body: { ...presentation(), quantidade } }, res); assert.equal(res.code, 400);
  }
  const res = response(); await apresentacoes.createApresentacao({ body: { ...presentation(), data_apresentacao: '2025-02-29' } }, res); assert.equal(res.code, 400);
});
test('minutes refuse impossible times and preserve multiline text without null bytes', async () => {
  for (const patch of [{ hora: '24:00' }, { hora: '12:60' }, { hora: '12:00:60' }, { data: '2026-04-31' }, { titulo: true }, { local: 'a'.repeat(256) }, { resumo: {} }, { resumo: 'Texto\u0000' }, { resumo: 'a'.repeat(30001) }]) {
    const res = response(); await atas.createAta({ body: { ...minutes(), ...patch } }, res); assert.equal(res.code, 400);
  }
});
test('foreign-key and duplicate conflicts have explicit 409 responses', async () => {
  for (const code of ['23503', '23505']) {
    pool.query = async () => { throw Object.assign(new Error('Conflict'), { code }); };
    const res = response(); await atas.deleteAta({ params: { id: '9' } }, res); assert.equal(res.code, 409);
  }
});
