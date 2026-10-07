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
const donations = await import('../modules/contribuicoes/contribuicoes.controller.js');

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

test("O registo público é recusado sem criar uma conta", async () => {
  const res = response();
  await auth.register({ body: { email: 'member@example.invalid', password: 'Password123!' } }, res);
  assert.equal(res.code, 403);
});

test("A sessão ativa usa o perfil atual da base de dados e não o perfil do JWT", async () => {
  pool.query = async () => select([{ id: 1, perfil: 'Membro', estado: 'Ativo', session_version: 0 }]);
  const { req, res, passed } = await verify();
  assert.equal(passed, true);
  permit('Administrador')(req, res, () => assert.fail('Member granted administrator access'));
  assert.equal(res.code, 403);
});

for (const [name, users] of [
  ['conta desativada', [{ id: 1, perfil: 'Administrador', estado: 'Inativo', session_version: 0 }]],
  ['conta eliminada', []],
  ['sessão revogada após alteração da palavra-passe ou do perfil', [{ id: 1, perfil: 'Administrador', estado: 'Ativo', session_version: 1 }]],
]) {
  test(`A sessão é recusada para ${name}`, async () => {
    pool.query = async () => select(users);
    const { res, passed } = await verify();
    assert.equal(passed, false);
    assert.equal(res.code, 401);
  });
}

test("Os tokens antigos exigem um novo login sem consultar a base de dados", async () => {
  const token = jwt.sign({ id: 1, perfil: 'Administrador' }, process.env.JWT_SECRET);
  const { res, passed } = await verify(token);
  assert.equal(passed, false);
  assert.equal(res.code, 401);
});

test("Um token inválido nunca chega à base de dados", async () => {
  const { res, passed } = await verify('invalid');
  assert.equal(passed, false);
  assert.equal(res.code, 401);
});

test("A indisponibilidade da base impede o acesso sem considerar a sessão válida", async () => {
  const { res, passed } = await verify();
  assert.equal(passed, false);
  assert.equal(res.code, 503);
});

test("Uma conta com o mesmo email mas sem associação explícita não pode consultar o perfil de membro", async () => {
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

test("O carregamento de fotografias por uma conta sem associação não guarda ficheiros nem cria um membro", async () => {
  pool.query = async (sql) => {
    assert.match(sql, /^SELECT id FROM membros WHERE utilizador_id/);
    return select([]);
  };
  const res = response();
  await members.uploadMembroFoto({ user: { id: 2 }, file: { buffer: Buffer.from('not saved') } }, res);
  assert.equal(res.code, 404);
});

test("A edição normal do membro preserva a associação à conta existente", async () => {
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

test("A Secretaria não pode atribuir outra conta a um membro", async () => {
  const res = response();
  await members.updateMember({ params: { id: '9' }, body: { nome: 'Member', utilizador_id: 2 }, user: { perfil: 'Secretaria' } }, res);
  assert.equal(res.code, 403);
});

test("O administrador não pode associar uma conta já ligada a outro membro", async () => {
  pool.query = async (sql) => {
    if (/SELECT utilizador_id/.test(sql)) return select([{ utilizador_id: null }]);
    if (/FROM utilizadores/.test(sql)) return select([{ id: 2 }]);
    return select([{ id: 10 }]);
  };
  const res = response();
  await members.updateMember({ params: { id: '9' }, body: { nome: 'Member', utilizador_id: 2 }, user: { perfil: 'Administrador' } }, res);
  assert.equal(res.code, 409);
});

test("O membro não pode alterar os dados oficiais de entrada e batismo pelo endpoint pessoal", async () => {
  pool.query = async (sql, params) => {
    assert.doesNotMatch(sql, /entrada\s*=|batizado\s*=/);
    assert.equal(params.length, 6);
    return { command: 'UPDATE', rowCount: 1, rows: [] };
  };
  const res = response();
  await members.updateMembroMe({ user: { id: 1 }, body: { entrada: '2000-01-01', batizado: 'Sim' } }, res);
  assert.equal(res.code, 200);
});

test("A alteração de um utilizador incrementa a versão da sessão", async () => {
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

test("A redefinição da palavra-passe consome um token válido, revoga sessões e confirma tudo numa transação", async () => {
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

test("Um token de redefinição usado ou expirado não pode alterar a palavra-passe", async () => {
  const operations = [];
  pool.connect = async () => ({ async query(sql) { operations.push(sql); return { rowCount: 0, rows: [] }; }, release() {} });
  const res = response();
  await auth.redefinirPassword({ body: { token: 'b'.repeat(64), nova_password: 'Password123!' } }, res);
  assert.equal(res.code, 400);
  assert.equal(operations.at(-1), 'ROLLBACK');
  assert.equal(operations.some((sql) => /UPDATE utilizadores/.test(sql)), false);
});

test("Uma falha na alteração da palavra-passe reverte o consumo do token", async () => {
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

test("Os pagamentos indisponíveis nunca apresentam um pedido simulado como enviado", () => {
  for (const handler of [donations.createDonation, donations.getDonationStatus]) {
    const res = response();
    handler({ body: { valor: 10 } }, res);
    assert.equal(res.code, 503);
    assert.equal(res.body.donationId, undefined);
  }
});
