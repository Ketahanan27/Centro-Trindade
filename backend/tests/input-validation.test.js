import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
import { validarMembro, validarUtilizador, emailNormalizado, validarId } from '../utils/inputValidation.js';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
const { pool } = await import('../config/db.js');
const members = await import('../modules/membros/membros.controller.js');
const auth = { ...await import('../modules/auth/auth.controller.js'), ...await import('../modules/utilizadores/utilizadores.controller.js') };
const { criarContaConvite } = await import('../modules/convites/convites.controller.js');
const original = pool.query;
const originalConnect = pool.connect;
const deny = async () => { throw new Error('Unexpected database access'); };
pool.query = deny; pool.connect = deny;
afterEach(() => { pool.query = deny; pool.connect = deny; });
after(async () => { pool.query = original; pool.connect = originalConnect; await pool.end(); });
const member = () => ({ nome: ' Maria Silva ', email: ' MARIA@example.invalid ', telemovel: '912345678', nascimento: '1990-02-28', sexo: 'Feminino', estado_civil: 'Solteiro(a)', morada: ' Rua Principal ', codigo_postal: '1000-001', entrada: '2020-03-01', estado: 'Ativo', batizado: 'Sim' });
function response() { return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }
test('rejects malformed payloads and identifiers before database access', async () => {
  for (const body of [null, [], 'texto', { nome: {} }, { nome: true }, { ...member(), email: {} }, { ...member(), morada: 'a'.repeat(256) }]) {
    const res = response(); await members.createMember({ body, user: { perfil: 'Administrador' } }, res); assert.equal(res.code, 400);
  }
  for (const id of ['abc', '-1', '0', '1.5', '2147483648', {}, true]) assert.throws(() => validarId(id));
});
test('dates, enumerations, phone and postal code are checked consistently', () => {
  for (const patch of [{ nascimento: '2025-02-29' }, { entrada: '2026-04-31' }, { nascimento: '0000-01-01' }, { sexo: 'Outro' }, { estado_civil: {} }, { estado: 'Apagado' }, { batizado: true }, { telemovel: 912345678 }, { telemovel: '91234567x' }, { codigo_postal: '12345' }, { utilizador_id: '2147483648' }]) assert.throws(() => validarMembro({ ...member(), ...patch }));
  assert.equal(validarMembro({ ...member(), nascimento: '2024-02-29' }).nascimento, '2024-02-29');
});
test('valid member inputs normalize whitespace and email without introducing account association', async () => {
  let saved;
  pool.query = async (sql, params) => { saved = params; assert.match(sql, /INSERT INTO membros/); return { command: 'INSERT', rowCount: 1, rows: [{ id: 1 }] }; };
  const res = response(); await members.createMember({ body: member(), user: { perfil: 'Secretaria' } }, res);
  assert.equal(res.code, 201); assert.equal(saved[0], 'Maria Silva'); assert.equal(saved[1], 'maria@example.invalid'); assert.equal(saved[6], 'Rua Principal'); assert.equal(saved[11], null);
});
test('personal validation ignores official records and never adds account association', () => {
  const result = validarMembro({ ...member(), utilizador_id: 99, entrada: {}, batizado: {} }, true);
  assert.equal(Object.hasOwn(result, 'utilizador_id'), false);
  assert.equal(Object.hasOwn(result, 'entrada'), false);
  assert.equal(Object.hasOwn(result, 'batizado'), false);
});
test('email and account validation enforce actual database limits', async () => {
  assert.equal(emailNormalizado(' Teste@Example.invalid '), 'teste@example.invalid');
  assert.throws(() => emailNormalizado('a'.repeat(145) + '@x.invalid'));
  for (const patch of [{ nome: 12 }, { perfil: 'Superadmin' }, { estado: {} }, { nome: 'a'.repeat(151) }]) assert.throws(() => validarUtilizador({ nome: 'Conta', perfil: 'Membro', estado: 'Ativo', ...patch }));
  const res = response(); await criarContaConvite({ body: { nome: 'Conta', email: 'a'.repeat(145) + '@x.invalid' } }, res); assert.equal(res.code, 400);
});
test('missing account update and deletion return 404', async () => {
  pool.query = async () => ({ command: 'UPDATE', rowCount: 0, rows: [] });
  const updated = response(); await auth.updateUser({ params: { id: '9' }, user: { id: 1 }, body: { nome: 'Conta', perfil: 'Membro', estado: 'Ativo' } }, updated); assert.equal(updated.code, 404);
  const removed = response(); await auth.deleteUser({ params: { id: '9' }, user: { id: 1 } }, removed); assert.equal(removed.code, 404);
});
test('missing member update and deletion return 404', async () => {
  pool.query = async () => ({ command: 'UPDATE', rowCount: 0, rows: [] });
  const updated = response(); await members.updateMember({ params: { id: '9' }, user: { perfil: 'Secretaria' }, body: member() }, updated); assert.equal(updated.code, 404);
  const removed = response(); await members.deleteMember({ params: { id: '9' } }, removed); assert.equal(removed.code, 404);
});
test('referenced accounts cannot be deleted with a misleading internal error', async () => {
  pool.query = async () => { throw Object.assign(new Error('Foreign key conflict'), { code: '23503' }); };
  const res = response(); await auth.deleteUser({ params: { id: '9' }, user: { id: 1 } }, res); assert.equal(res.code, 409);
});
test('malformed login never queries or hashes and legacy email variants reach the same account lookup', async () => {
  for (const body of [null, [], { email: {}, password: 'Password123!' }, { email: 'a@example.invalid', password: {} }]) {
    const res = response(); await auth.login({ body }, res); assert.equal(res.code, 400);
  }
  pool.query = async (sql, params) => { assert.match(sql, /lower\(trim\(email\)\)/); assert.equal(params[0], 'teste@example.invalid'); return { command: 'SELECT', rows: [] }; };
  const res = response(); await auth.login({ body: { email: ' TESTE@example.invalid ', password: 'Password123!' } }, res); assert.equal(res.code, 401);
});
