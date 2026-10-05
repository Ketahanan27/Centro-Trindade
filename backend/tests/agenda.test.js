import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
import { validarEvento } from '../utils/secretariaValidation.js';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
const { pool } = await import('../config/db.js');
const agenda = await import('../controllers/agendaController.js');
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
