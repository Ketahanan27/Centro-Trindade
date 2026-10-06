import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import express from 'express';
import rateLimit from 'express-rate-limit';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
const { PostgresRateLimitStore } = await import('../middleware/postgresRateLimitStore.js');
const { pool } = await import('../config/db.js');
after(async () => { await pool.end(); });
function fixture() {
  const rows = new Map(); const calls = [];
  return { rows, calls, async query(sql, params) {
    calls.push([sql, params]);
    if (sql.startsWith('INSERT')) {
      assert.match(sql, /ON CONFLICT \(key_hash\) DO UPDATE/);
      assert.match(sql, /RETURNING hits, reset_at/);
      const previous = rows.get(params[0]);
      const row = previous && previous.reset_at > new Date() ? { ...previous, hits: previous.hits + 1 } : { hits: 1, reset_at: new Date(Date.now() + params[1]) };
      rows.set(params[0], row); return { rows: [row] };
    }
    if (sql.startsWith('DELETE')) rows.delete(params[0]);
    return { rows: [] };
  } };
}
test('different instances share counters without storing raw IP addresses', async () => {
  const db = fixture(); const a = new PostgresRateLimitStore('login', db); const b = new PostgresRateLimitStore('login', db);
  a.init({ windowMs: 900000 }); b.init({ windowMs: 900000 });
  assert.equal((await a.increment('192.0.2.1')).totalHits, 1);
  assert.equal((await b.increment('192.0.2.1')).totalHits, 2);
  assert.match(db.calls[0][1][0], /^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(db.calls).includes('192.0.2.1'), false);
});
test('expired windows restart and independent scopes do not consume each other limits', async () => {
  const db = fixture(); const a = new PostgresRateLimitStore('auth', db); const b = new PostgresRateLimitStore('contacto', db);
  a.init({ windowMs: 900000 }); b.init({ windowMs: 3600000 });
  await a.increment('client'); assert.equal((await b.increment('client')).totalHits, 1);
  db.rows.get(a.key('client')).reset_at = new Date(0);
  assert.equal((await a.increment('client')).totalHits, 1);
});
test('database outage denies protected requests with an explicit store error', async () => {
  const store = new PostgresRateLimitStore('auth', { query: async () => { throw new Error('Database unavailable'); } });
  store.init({ windowMs: 1000 });
  await assert.rejects(store.increment('client'), { code: 'RATE_LIMIT_STORAGE' });
});
test('HTTP middleware blocks after shared limit and supplies retry headers', async () => {
  const db = fixture(); const app = express();
  const store = new PostgresRateLimitStore('http-test', db);
  app.use(rateLimit({ windowMs: 60000, limit: 2, store, standardHeaders: true, legacyHeaders: false }));
  app.get('/', (_req, res) => res.json({ ok: true }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const url = `http://127.0.0.1:${server.address().port}/`;
    assert.equal((await fetch(url)).status, 200); assert.equal((await fetch(url)).status, 200);
    const blocked = await fetch(url); assert.equal(blocked.status, 429); assert.ok(blocked.headers.get('retry-after'));
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
