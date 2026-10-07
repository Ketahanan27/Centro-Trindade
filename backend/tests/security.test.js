import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
import jwt from 'jsonwebtoken';

// Set fixtures before imports: tests cannot accidentally connect to production.
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
process.env.JWT_SECRET = 'isolated-security-test-secret';
process.env.BLOB_READ_WRITE_TOKEN = '';
const { pool } = await import('../config/db.js');
const { verifyToken, permit } = await import('../middleware/auth.js');
const auth = { ...await import('../modules/auth/auth.controller.js'), ...await import('../modules/utilizadores/utilizadores.controller.js') };
const members = await import('../modules/membros/membros.controller.js');
const donations = await import('../controllers/donateController.js');

const originalQuery = pool.query;
const originalConnect = pool.connect;
pool.query = async () => { throw new Error('Unexpected database access'); };
pool.connect = async () => { throw new Error('Unexpected database connection'); };
afterEach(() => {
  pool.query = async () => { throw new Error('Unexpected database access'); };
  pool.connect = async () => { throw new Error('Unexpected database connection'); };
});
after(async () => { pool.query = originalQuery; pool.connect = originalConnect; await pool.end(); });

function response() {
  return { code: 200, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}
const sign = (claims = {}) => jwt.sign({ id: 1, perfil: 'Administrador', session_version: 0, ...claims }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1m' });
async function verify(token = sign()) {
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = response();
  let passed = false;
  await verifyToken(req, res, () => { passed = true; });
  return { req, res, passed };
}
const select = (rows) => ({ command: 'SELECT', rows });

test('public signup is rejected without creating an account', async () => {
  const res = response();
  await auth.register({ body: { email: 'member@example.invalid', password: 'Password123!' } }, res);
  assert.equal(res.code, 403);
});

test('active session uses the current database role, not the JWT role', async () => {
  pool.query = async () => select([{ id: 1, perfil: 'Membro', estado: 'Ativo', session_version: 0 }]);
  const { req, res, passed } = await verify();
  assert.equal(passed, true);
  permit('Administrador')(req, res, () => assert.fail('Member granted administrator access'));
  assert.equal(res.code, 403);
});

for (const [name, users] of [
  ['disabled account', [{ id: 1, perfil: 'Administrador', estado: 'Inativo', session_version: 0 }]],
  ['deleted account', []],
  ['revoked session after password or role change', [{ id: 1, perfil: 'Administrador', estado: 'Ativo', session_version: 1 }]],
]) {
  test(`session rejected for ${name}`, async () => {
    pool.query = async () => select(users);
    const { res, passed } = await verify();
    assert.equal(passed, false);
    assert.equal(res.code, 401);
  });
}

test('legacy tokens require a new login without querying the database', async () => {
  const token = jwt.sign({ id: 1, perfil: 'Administrador' }, process.env.JWT_SECRET);
  const { res, passed } = await verify(token);
  assert.equal(passed, false);
  assert.equal(res.code, 401);
});

test('invalid token never reaches the database', async () => {
  const { res, passed } = await verify('invalid');
  assert.equal(passed, false);
  assert.equal(res.code, 401);
});

test('database outage denies access without treating it as a successful session', async () => {
  const { res, passed } = await verify();
  assert.equal(passed, false);
  assert.equal(res.code, 503);
});

test('same-email account without an explicit link cannot read a member profile', async () => {
  pool.query = async (sql, params) => {
    // Fixture: account 2 shares a member email, but only account 1 is approved.
    const linked = params[0] === 1 || /OR\s+u\.email/i.test(sql);
    return select(linked ? [{ id: 9, nome: 'Approved member' }] : []);
  };
  const denied = response();
  await members.getMembroMe({ user: { id: 2 } }, denied);
  assert.equal(denied.code, 404);
  const allowed = response();
  await members.getMembroMe({ user: { id: 1 } }, allowed);
  assert.equal(allowed.code, 200);
  assert.equal(allowed.body.id, 9);
});

test('photo upload for an unlinked account neither saves a file nor creates membership', async () => {
  pool.query = async (sql) => {
    assert.match(sql, /^SELECT id FROM membros WHERE utilizador_id/);
    return select([]);
  };
  const res = response();
  await members.uploadMembroFoto({ user: { id: 2 }, file: { buffer: Buffer.from('not saved') } }, res);
  assert.equal(res.code, 404);
});

test('ordinary member edit preserves the existing account association', async () => {
  let association = 7;
  pool.query = async (sql, params) => {
    assert.match(sql, /CASE WHEN \$14::boolean THEN \$12::integer ELSE utilizador_id END/);
    if (params[13]) association = params[11];
    return { command: 'UPDATE', rowCount: 1, rows: [] };
  };
  const res = response();
  await members.updateMember({ params: { id: '9' }, body: { nome: 'Member' }, user: { perfil: 'Secretaria' } }, res);
  assert.equal(res.code, 200);
  assert.equal(association, 7);
});

test('secretary cannot assign a different account to a member', async () => {
  const res = response();
  await members.updateMember({ params: { id: '9' }, body: { nome: 'Member', utilizador_id: 2 }, user: { perfil: 'Secretaria' } }, res);
  assert.equal(res.code, 403);
});

test('administrator cannot associate a account already linked to another member', async () => {
  pool.query = async (sql) => {
    if (/SELECT utilizador_id/.test(sql)) return select([{ utilizador_id: null }]);
    if (/FROM utilizadores/.test(sql)) return select([{ id: 2 }]);
    return select([{ id: 10 }]);
  };
  const res = response();
  await members.updateMember({ params: { id: '9' }, body: { nome: 'Member', utilizador_id: 2 }, user: { perfil: 'Administrador' } }, res);
  assert.equal(res.code, 409);
});

test('member cannot change official entry and baptism through the personal endpoint', async () => {
  pool.query = async (sql, params) => {
    assert.doesNotMatch(sql, /entrada\s*=|batizado\s*=/);
    assert.equal(params.length, 6);
    return { command: 'UPDATE', rowCount: 1, rows: [] };
  };
  const res = response();
  await members.updateMembroMe({ user: { id: 1 }, body: { entrada: '2000-01-01', batizado: 'Sim' } }, res);
  assert.equal(res.code, 200);
});

test('changing a user increments the session version', async () => {
  let version = 0;
  pool.query = async (sql) => {
    assert.match(sql, /session_version = session_version \+ 1/);
    version++;
    return { command: 'UPDATE', rowCount: 1, rows: [] };
  };
  const res = response();
  await auth.updateUser({ params: { id: '2' }, user: { id: 1 }, body: { nome: 'Member', perfil: 'Membro', estado: 'Inativo' } }, res);
  assert.equal(res.code, 200);
  assert.equal(version, 1);
});

test('password reset consumes a valid token, revokes sessions and commits as one transaction', async () => {
  const operations = [];
  let released = false;
  pool.connect = async () => ({
    async query(sql) {
      operations.push(sql);
      if (/RETURNING id, utilizador_id/.test(sql)) return { rowCount: 1, rows: [{ id: 3, utilizador_id: 1 }] };
      return { rowCount: 1, rows: [] };
    },
    release() { released = true; },
  });
  const res = response();
  await auth.redefinirPassword({ body: { token: 'a'.repeat(64), nova_password: 'Password123!' } }, res);
  assert.equal(res.code, 200);
  assert.equal(operations[0], 'BEGIN');
  assert.match(operations[1], /usado = 0 AND expiry > NOW/);
  assert.ok(operations.some((sql) => /session_version = session_version \+ 1/.test(sql)));
  assert.equal(operations.at(-1), 'COMMIT');
  assert.equal(released, true);
});

test('used or expired reset token cannot change the password', async () => {
  const operations = [];
  pool.connect = async () => ({ async query(sql) { operations.push(sql); return { rowCount: 0, rows: [] }; }, release() {} });
  const res = response();
  await auth.redefinirPassword({ body: { token: 'b'.repeat(64), nova_password: 'Password123!' } }, res);
  assert.equal(res.code, 400);
  assert.equal(operations.at(-1), 'ROLLBACK');
  assert.equal(operations.some((sql) => /UPDATE utilizadores/.test(sql)), false);
});

test('failed password update rolls back token consumption', async () => {
  const operations = [];
  pool.connect = async () => ({
    async query(sql) {
      operations.push(sql);
      if (/RETURNING id, utilizador_id/.test(sql)) return { rowCount: 1, rows: [{ id: 3, utilizador_id: 1 }] };
      if (/UPDATE utilizadores/.test(sql)) throw new Error('Simulated failure');
      return { rowCount: 1, rows: [] };
    }, release() {},
  });
  const res = response();
  await auth.redefinirPassword({ body: { token: 'a'.repeat(64), nova_password: 'Password123!' } }, res);
  assert.equal(res.code, 500);
  assert.equal(operations.at(-1), 'ROLLBACK');
  assert.equal(operations.includes('COMMIT'), false);
});

test('unavailable payments never report a mock payment request as sent', () => {
  for (const handler of [donations.createDonation, donations.getDonationStatus]) {
    const res = response();
    handler({ body: { valor: 10 } }, res);
    assert.equal(res.code, 503);
    assert.equal(res.body.donationId, undefined);
  }
});
