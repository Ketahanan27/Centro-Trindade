import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';

process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
const { pool } = await import('../config/db.js');
const { criarUtilizadoresService } = await import('../modules/utilizadores/utilizadores.service.js');
const { criarAuthService } = await import('../modules/auth/auth.service.js');
const { criarConvitesService } = await import('../modules/convites/convites.service.js');
const { comTransacao } = await import('../utils/transacao.js');
const originals = { query: pool.query, connect: pool.connect };
const deny = async () => { throw new Error('Unexpected external access'); };
pool.query = deny;
pool.connect = deny;
afterEach(() => { pool.query = deny; pool.connect = deny; });
after(async () => { pool.query = originals.query; pool.connect = originals.connect; await pool.end(); });

test('user service blocks self deletion and profile changes before persistence', async () => {
  const service = criarUtilizadoresService({});
  await assert.rejects(service.eliminar('7', 7), { status: 400 });
  await assert.rejects(service.atualizar('7', { nome: 'Conta', perfil: 'Membro', estado: 'Ativo' }, 7), { status: 400 });
});

test('user listing uses legacy fallback only for missing columns', async () => {
  const rows = [{ id: 7, ultimo_acesso: null }];
  const service = criarUtilizadoresService({
    listar: async () => { throw Object.assign(new Error('Coluna ausente'), { code: '42703' }); },
    listarLegado: async () => rows,
  });
  assert.deepEqual(await service.listar(), rows);
  const failure = new Error('Base indisponível');
  await assert.rejects(criarUtilizadoresService({ listar: async () => { throw failure; } }).listar(), failure);
});

test('password reset rejects malformed payloads before hashing or persistence', async () => {
  const service = criarAuthService({});
  for (const payload of [null, undefined, [], {}, { token: 'a'.repeat(64), nova_password: 'é'.repeat(37) }]) {
    await assert.rejects(service.redefinir(payload), { status: 400 });
  }
});

test('failed transaction commit rolls back and releases the connection', async () => {
  const calls = [];
  let released = false;
  pool.connect = async () => ({
    query: async sql => { calls.push(sql); if (sql === 'COMMIT') throw new Error('Commit failed'); },
    release() { released = true; },
  });
  await assert.rejects(comTransacao(async () => 'resultado'), /Commit failed/);
  assert.deepEqual(calls, ['BEGIN', 'COMMIT', 'ROLLBACK']);
  assert.equal(released, true);
});

test('failed transaction begin and rollback still release the connection', async () => {
  let released = false;
  pool.connect = async () => ({
    query: async () => { throw new Error('Connection lost'); },
    release() { released = true; },
  });
  await assert.rejects(comTransacao(() => assert.fail('Transaction executed')), /Connection lost/);
  assert.equal(released, true);
});

test('inactive account creation stores no token and sends no email', async () => {
  let committed = false;
  const service = criarConvitesService({
    comTransacao: async executar => {
      const result = await executar({
        bloquearEmail: async () => {}, procurarEmail: async () => ({ rows: [] }),
        criarConta: async dados => {
          assert.equal(dados.estado, 'Inativo');
          return { rows: [{ id: 7 }] };
        },
      });
      committed = true;
      return result;
    },
  }, () => assert.fail('Email sent'));
  const result = await service.criar({ nome: 'Conta', email: 'teste@example.invalid', estado: 'Inativo' });
  assert.equal(committed, true);
  assert.equal(result.email_enviado, false);
  assert.match(result.message, /Conta inativa criada/);
});

test('invitation and recovery lifetimes use the injected clock and hashed tokens', async () => {
  const now = Date.parse('2026-10-07T12:00:00Z');
  for (const convite of [true, false]) {
    let expiry;
    let storedHash;
    let deliveredToken;
    let committed = false;
    const service = criarConvitesService({
      comTransacao: async executar => {
        const result = await executar({
          procurarConta: async () => ({ rows: [{ id: 7, estado: 'Ativo', convite_pendente: convite }] }),
          invalidarLinks: async () => {},
          guardarToken: async (_id, hash, date) => { storedHash = hash; expiry = date; },
        });
        committed = true;
        return result;
      },
    }, async (_user, token) => { assert.equal(committed, true); deliveredToken = token; }, () => now);
    await service.emitir(convite ? 'convite' : 'reset', null, '7');
    assert.equal(expiry.getTime(), now + (convite ? 48 * 60 : 30) * 60 * 1000);
    assert.match(storedHash, /^sha256:[a-f0-9]{64}$/);
    assert.notEqual(storedHash, deliveredToken);
  }
});
