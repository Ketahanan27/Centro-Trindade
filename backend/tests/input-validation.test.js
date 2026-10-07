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
test("Rejeita dados e identificadores malformados antes de aceder à base de dados", async () => {
  for (const body of [null, [], 'texto', { nome: {} }, { nome: true }, { ...member(), email: {} }, { ...member(), morada: 'a'.repeat(256) }]) {
    const res = response(); await members.createMember({ body, user: { perfil: 'Administrador' } }, res); assert.equal(res.code, 400);
  }
  for (const id of ['abc', '-1', '0', '1.5', '2147483648', {}, true]) assert.throws(() => validarId(id));
});
test("As datas, opções, telemóvel e código postal são verificados de forma consistente", () => {
  for (const patch of [{ nascimento: '2025-02-29' }, { entrada: '2026-04-31' }, { nascimento: '0000-01-01' }, { sexo: 'Outro' }, { estado_civil: {} }, { estado: 'Apagado' }, { batizado: true }, { telemovel: 912345678 }, { telemovel: '91234567x' }, { codigo_postal: '12345' }, { utilizador_id: '2147483648' }]) assert.throws(() => validarMembro({ ...member(), ...patch }));
  assert.equal(validarMembro({ ...member(), nascimento: '2024-02-29' }).nascimento, '2024-02-29');
});
test("Os dados válidos de membro normalizam espaços e email sem introduzir associação à conta", async () => {
  let saved;
  pool.query = async (sql, params) => { saved = params; assert.match(sql, /INSERT INTO membros/); return { command: 'INSERT', rowCount: 1, rows: [{ id: 1 }] }; };
  const res = response(); await members.createMember({ body: member(), user: { perfil: 'Secretaria' } }, res);
  assert.equal(res.code, 201); assert.equal(saved[0], 'Maria Silva'); assert.equal(saved[1], 'maria@example.invalid'); assert.equal(saved[6], 'Rua Principal'); assert.equal(saved[11], null);
});
test("A validação pessoal ignora registos oficiais e nunca acrescenta associação à conta", () => {
  const result = validarMembro({ ...member(), utilizador_id: 99, entrada: {}, batizado: {} }, true);
  assert.equal(Object.hasOwn(result, 'utilizador_id'), false);
  assert.equal(Object.hasOwn(result, 'entrada'), false);
  assert.equal(Object.hasOwn(result, 'batizado'), false);
});
test("A validação de email e conta respeita os limites reais da base de dados", async () => {
  assert.equal(emailNormalizado(' Teste@Example.invalid '), 'teste@example.invalid');
  assert.throws(() => emailNormalizado('a'.repeat(145) + '@x.invalid'));
  for (const patch of [{ nome: 12 }, { perfil: 'Superadmin' }, { estado: {} }, { nome: 'a'.repeat(151) }]) assert.throws(() => validarUtilizador({ nome: 'Conta', perfil: 'Membro', estado: 'Ativo', ...patch }));
  const res = response(); await criarContaConvite({ body: { nome: 'Conta', email: 'a'.repeat(145) + '@x.invalid' } }, res); assert.equal(res.code, 400);
});
test("A atualização e a eliminação de uma conta ausente devolvem 404", async () => {
  pool.query = async () => ({ command: 'UPDATE', rowCount: 0, rows: [] });
  const updated = response(); await auth.updateUser({ params: { id: '9' }, user: { id: 1 }, body: { nome: 'Conta', perfil: 'Membro', estado: 'Ativo' } }, updated); assert.equal(updated.code, 404);
  const removed = response(); await auth.deleteUser({ params: { id: '9' }, user: { id: 1 } }, removed); assert.equal(removed.code, 404);
});
test("A atualização e a eliminação de um membro ausente devolvem 404", async () => {
  pool.query = async () => ({ command: 'UPDATE', rowCount: 0, rows: [] });
  const updated = response(); await members.updateMember({ params: { id: '9' }, user: { perfil: 'Secretaria' }, body: member() }, updated); assert.equal(updated.code, 404);
  const removed = response(); await members.deleteMember({ params: { id: '9' } }, removed); assert.equal(removed.code, 404);
});
test("As contas com registos associados não são eliminadas com um erro interno enganador", async () => {
  pool.query = async () => { throw Object.assign(new Error('Foreign key conflict'), { code: '23503' }); };
  const res = response(); await auth.deleteUser({ params: { id: '9' }, user: { id: 1 } }, res); assert.equal(res.code, 409);
});
test("Um login malformado não consulta a base nem calcula hashes e as variantes antigas do email usam a mesma procura de conta", async () => {
  for (const body of [null, [], { email: {}, password: 'Password123!' }, { email: 'a@example.invalid', password: {} }]) {
    const res = response(); await auth.login({ body }, res); assert.equal(res.code, 400);
  }
  pool.query = async (sql, params) => { assert.match(sql, /lower\(trim\(email\)\)/); assert.equal(params[0], 'teste@example.invalid'); return { command: 'SELECT', rows: [] }; };
  const res = response(); await auth.login({ body: { email: ' TESTE@example.invalid ', password: 'Password123!' } }, res); assert.equal(res.code, 401);
});
