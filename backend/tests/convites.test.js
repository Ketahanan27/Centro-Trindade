import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
import nodemailer from 'nodemailer';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
process.env.FRONTEND_URL = 'https://example.invalid';
const { pool } = await import('../config/db.js');
const { hashToken, criarContaConvite, emitirLinkConta } = await import('../controllers/convitesController.js');
const { redefinirPassword } = await import('../controllers/authController.js');
const originals = { connect: pool.connect, query: pool.query, mail: nodemailer.createTransport };
const block = () => { throw new Error('Unexpected external access'); };
afterEach(() => { pool.connect = block; pool.query = block; nodemailer.createTransport = block; });
after(async () => { pool.connect = originals.connect; pool.query = originals.query; nodemailer.createTransport = originals.mail; await pool.end(); });
const body = () => ({ nome: 'Pessoa <teste>', email: 'TESTE@example.invalid', perfil: 'Membro', estado: 'Ativo' });
function response() { return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }
function setup({ existing = false, missing = false, active = true, pending = true, failToken = false, failMail = false } = {}) {
  const calls = []; const messages = [];
  const user = { id: 9, nome: 'Pessoa <teste>', email: 'teste@example.invalid', estado: active ? 'Ativo' : 'Inativo', convite_pendente: pending };
  pool.connect = async () => ({ release() { calls.push(['RELEASE']); }, async query(sql, params) {
    calls.push([sql, params]);
    if (sql.startsWith('SELECT id FROM')) return { rows: existing ? [{ id: 9 }] : [] };
    if (sql.startsWith('SELECT id,nome')) return { rows: missing ? [] : [user] };
    if (sql.startsWith('INSERT INTO utilizadores')) return { rows: [user] };
    if (failToken && sql.startsWith('INSERT INTO password_resets')) throw new Error('Token storage failed');
    return { rows: [], rowCount: 1 };
  } });
  pool.query = async (sql, params) => { calls.push([sql, params]); return { rowCount: 1, rows: [] }; };
  nodemailer.createTransport = () => ({ close() {}, async sendMail(message) {
    assert.ok(calls.some(([sql]) => sql === 'COMMIT'));
    messages.push(message); if (failMail) throw new Error('Mail failed');
  } });
  return { calls, messages };
}
test('creation stores only token hash and commits account and token before email', async () => {
  const { calls, messages } = setup(); const res = response();
  await criarContaConvite({ body: body() }, res);
  assert.equal(res.code, 201); assert.equal(res.body.email_enviado, true);
  const insert = calls.find(([sql]) => sql.startsWith('INSERT INTO password_resets'));
  const token = messages[0].html.match(/token=([a-f0-9]{64})/)[1];
  assert.equal(insert[1][1], hashToken(token)); assert.notEqual(insert[1][1], token);
  assert.match(messages[0].html, /Pessoa &lt;teste&gt;/);
  assert.equal(calls.find(([sql]) => sql.startsWith('INSERT INTO utilizadores'))[1][1], 'teste@example.invalid');
});
test('token persistence failure rolls back account creation and sends no email', async () => {
  const { calls, messages } = setup({ failToken: true }); const res = response();
  await criarContaConvite({ body: body() }, res);
  assert.equal(res.code, 500); assert.equal(messages.length, 0);
  assert.ok(calls.some(([sql]) => sql === 'ROLLBACK')); assert.ok(!calls.some(([sql]) => sql === 'COMMIT'));
});
test('delivery failure preserves pending account and revokes only the failed link', async () => {
  const { calls } = setup({ failMail: true }); const res = response();
  await criarContaConvite({ body: body() }, res);
  assert.equal(res.code, 201); assert.equal(res.body.email_enviado, false);
  assert.match(res.body.message, /Reenviar convite/);
  assert.ok(calls.some(([sql]) => sql === 'UPDATE password_resets SET usado=1 WHERE token=$1'));
});
test('duplicate email returns conflict without another account or email', async () => {
  const { calls, messages } = setup({ existing: true }); const res = response();
  await criarContaConvite({ body: body() }, res);
  assert.equal(res.code, 409); assert.equal(messages.length, 0);
  assert.ok(!calls.some(([sql]) => sql.startsWith('INSERT')));
});
test('resending locks existing account, rotates link and never creates another account', async () => {
  const { calls, messages } = setup(); const res = response();
  await emitirLinkConta('convite')({ params: { id: '9' } }, res);
  assert.equal(res.code, 200); assert.equal(messages.length, 1);
  assert.ok(calls.some(([sql]) => sql.includes('FOR UPDATE')));
  assert.ok(calls.some(([sql]) => sql.startsWith('UPDATE password_resets SET usado = 1')));
  assert.ok(!calls.some(([sql]) => sql.startsWith('INSERT INTO utilizadores')));
});
test('configured and inactive accounts cannot receive an invitation resend', async () => {
  for (const options of [{ pending: false }, { active: false }]) {
    const { messages } = setup(options); const res = response();
    await emitirLinkConta('convite')({ params: { id: '9' } }, res);
    assert.equal(res.code, 409); assert.equal(messages.length, 0);
  }
});
test('public recovery gives same response for missing accounts and delivery failures', async () => {
  const bodies = [];
  for (const options of [{ missing: true }, { failMail: true }, {}]) {
    setup(options); const res = response();
    await emitirLinkConta('recuperar')({ body: { email: 'teste@example.invalid' } }, res);
    assert.equal(res.code, 200); bodies.push(res.body);
  }
  assert.deepEqual(bodies[0], bodies[1]); assert.deepEqual(bodies[1], bodies[2]);
});
test('stored hashes cannot be used as reset bearer tokens', async () => {
  pool.connect = block; const res = response();
  await redefinirPassword({ body: { token: hashToken('a'.repeat(64)), nova_password: 'Password123!' } }, res);
  assert.equal(res.code, 400);
});
