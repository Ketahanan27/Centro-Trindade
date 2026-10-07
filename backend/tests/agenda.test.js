import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
import { validarEvento } from '../utils/secretariaValidation.js';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
const { pool } = await import('../config/db.js');
const agenda = await import('../modules/agenda/agenda.controller.js');
const { criarAgendaService, hojeLisboa } = await import('../modules/agenda/agenda.service.js');
const original = pool.query;
const deny = async () => { throw new Error('Unexpected database access'); };
pool.query = deny;
afterEach(() => { pool.query = deny; });
after(async () => { pool.query = original; await pool.end(); });
function response() { return { code: 200, headers: {}, set(key, value) { this.headers[key] = value; return this; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }
const evento = () => ({ titulo: ' Evento ', descricao: 'Linha A\nLinha B', data_evento: '2099-01-01', hora_evento: '10:30', local_evento: ' Sala ', estado: 'Agendado' });
test('events default to internal and refuse invalid dates, hours, state and visibility', () => {
  assert.equal(validarEvento(evento()).publico, false);
  for (const patch of [{ titulo: {} }, { titulo: 'a'.repeat(151) }, { data_evento: '2026-02-30' }, { hora_evento: '25:00' }, { estado: 'Privado' }, { publico: 'true' }, { descricao: {} }]) assert.throws(() => validarEvento({ ...evento(), ...patch }));
});
test('public query filters visibility and status in SQL instead of trusting frontend filters', async () => {
  pool.query = async (sql) => {
    assert.match(sql, /WHERE publico = true AND estado = 'Agendado'/);
    assert.doesNotMatch(sql.split('FROM')[0], /criado_em|publico/);
    return { command: 'SELECT', rows: [{ id: 1, titulo: 'Público' }] };
  };
  const res = response(); await agenda.getPublicEvents({}, res);
  assert.equal(res.body.length, 1); assert.equal(res.headers['Cache-Control'], 'no-store');
});
test('internal query includes visibility and all events without public filtering', async () => {
  pool.query = async (sql) => { assert.match(sql, /, publico FROM eventos/); assert.doesNotMatch(sql, /WHERE publico/); return { command: 'SELECT', rows: [] }; };
  const res = response(); await agenda.getEvents({}, res); assert.equal(res.headers['Cache-Control'], 'private, no-store');
});
test('creation saves explicit visibility and normalizes text', async () => {
  pool.query = async (sql, params) => { assert.match(sql, /INSERT INTO eventos/); assert.equal(params[0], 'Evento'); assert.equal(params[6], true); return { command: 'INSERT', rows: [{ id: 1 }], rowCount: 1 }; };
  const res = response(); await agenda.createEvent({ body: { ...evento(), publico: true } }, res); assert.equal(res.code, 201);
});
test('past event creation is refused before SQL but corrections remain possible', async () => {
  const rejected = response(); await agenda.createEvent({ body: { ...evento(), data_evento: '2000-01-01' } }, rejected); assert.equal(rejected.code, 400);
  pool.query = async () => ({ command: 'UPDATE', rowCount: 1, rows: [] });
  const updated = response(); await agenda.updateEvent({ params: { id: '1' }, body: { ...evento(), data_evento: '2000-01-01', estado: 'Concluído' } }, updated); assert.equal(updated.code, 200);
});
test('invalid and absent IDs have clear 400 and 404 responses', async () => {
  const invalid = response(); await agenda.deleteEvent({ params: { id: 'abc' } }, invalid); assert.equal(invalid.code, 400);
  pool.query = async (sql) => ({ command: sql.startsWith('SELECT') ? 'SELECT' : 'DELETE', rowCount: 0, rows: [] });
  const absent = response(); await agenda.deleteEvent({ params: { id: '9' } }, absent); assert.equal(absent.code, 404);
});
test('past event deletion remains blocked by a conditional DELETE', async () => {
  pool.query = async (sql) => {
    if (sql.startsWith('DELETE')) { assert.match(sql, /data_evento >= \$2::date/); return { command: 'DELETE', rowCount: 0, rows: [] }; }
    return { command: 'SELECT', rows: [{ id: 1 }] };
  };
  const res = response(); await agenda.deleteEvent({ params: { id: '1' } }, res); assert.equal(res.code, 400);
});

test('agenda service refuses past creation before persistence and sends normalized data', async () => {
  const guardados = [];
  const service = criarAgendaService({ criar: async dados => { guardados.push(dados); return 7; } }, () => '2026-10-07');
  await assert.rejects(service.criar({ ...evento(), data_evento: '2026-10-06' }), error => error.status === 400);
  assert.equal(guardados.length, 0);
  assert.equal(await service.criar({ ...evento(), data_evento: '2026-10-07' }), 7);
  assert.equal(guardados[0].titulo, 'Evento');
  assert.equal(guardados[0].publico, false);
});

test('agenda service validates identifiers but permits correcting past events', async () => {
  const atualizados = [];
  const service = criarAgendaService({ atualizar: async (...args) => { atualizados.push(args); return 1; } });
  await assert.rejects(service.atualizar('abc', evento()), error => error.status === 400);
  assert.equal(atualizados.length, 0);
  await service.atualizar('7', { ...evento(), data_evento: '2000-01-01', estado: 'Concluído' });
  assert.equal(atualizados[0][0], 7);
  assert.equal(atualizados[0][1].estado, 'Concluído');
});

test('agenda service distinguishes past and absent events only after a protected delete fails', async () => {
  const chamadas = [];
  const service = criarAgendaService({
    eliminarNaoRealizado: async (id, hoje) => { chamadas.push([id, hoje]); return id === 1 ? 1 : 0; },
    existe: async id => { chamadas.push(['existe', id]); return id === 2; },
  }, () => '2026-10-07');
  await service.eliminar('1');
  assert.deepEqual(chamadas, [[1, '2026-10-07']]);
  await assert.rejects(service.eliminar('2'), error => error.status === 400 && error.message.includes('já realizados'));
  await assert.rejects(service.eliminar('3'), error => error.status === 404);
});

test('agenda clock returns ISO date in Lisbon across midnight and summer time', () => {
  assert.equal(hojeLisboa(new Date('2026-06-30T23:30:00Z')), '2026-07-01');
  assert.equal(hojeLisboa(new Date('2026-12-31T23:30:00Z')), '2026-12-31');
});

test('agenda write controllers preserve conflict responses and absent-update handling', async () => {
  pool.query = async () => { throw Object.assign(new Error('Simulated foreign key conflict'), { code: '23503' }); };
  const criado = response();
  await agenda.createEvent({ body: evento() }, criado);
  assert.equal(criado.code, 409);
  assert.equal(criado.body.message, 'Existem registos associados que impedem esta operação.');
  const eliminado = response();
  await agenda.deleteEvent({ params: { id: '7' } }, eliminado);
  assert.equal(eliminado.code, 409);
  assert.equal(eliminado.body.message, 'Existem registos associados a este evento.');
  pool.query = async () => ({ command: 'UPDATE', rowCount: 0, rows: [] });
  const atualizado = response();
  await agenda.updateEvent({ params: { id: '7' }, body: evento() }, atualizado);
  assert.equal(atualizado.code, 404);
});
