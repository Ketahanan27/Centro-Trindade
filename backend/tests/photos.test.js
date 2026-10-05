import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
const { pool } = await import('../config/db.js');
const { getMembroFoto } = await import('../controllers/membroFotoController.js');
const { getMembers, getMembroMe } = await import('../controllers/membroController.js');
const { photoAccess, readPhoto, uploadDir } = await import('../config/photoStorage.js');
const originalQuery = pool.query;
afterEach(() => { pool.query = async () => { throw new Error('Unexpected database access'); }; });
after(async () => { pool.query = originalQuery; await pool.end(); });
const select = (rows) => ({ command: 'SELECT', rows });
function response() { return { code: 200, headers: {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, set(key, value) { this.headers[key] = value; return this; }, type(value) { this.contentType = value; return this; }, send(body) { this.body = body; return this; } }; }
test('photo retrieval filters ordinary accounts by explicit association', async () => {
  pool.query = async (sql, params) => { assert.match(sql, /utilizador_id = \$3/); assert.deepEqual(params, ['9', false, 2]); return select([]); };
  const res = response();
  await getMembroFoto({ params: { id: '9' }, user: { id: 2, perfil: 'Membro' } }, res);
  assert.equal(res.code, 404);
});
test('only authorized staff can bypass personal photo association', async () => {
  for (const perfil of ['Administrador', 'Secretaria', 'Pastor', 'Tesouraria']) {
    pool.query = async (sql, params) => { assert.equal(params[1], perfil !== 'Tesouraria'); return select([]); };
    await getMembroFoto({ params: { id: '9' }, user: { id: 2, perfil } }, response());
  }
});
test('API member payloads replace storage URLs with authenticated endpoints', async () => {
  pool.query = async () => select([{ id: 9, foto: 'https://store.public.blob.vercel-storage.com/secret.png' }]);
  const list = response(); await getMembers({}, list);
  assert.equal(list.body[0].foto, '/api/membros/9/foto');
  const own = response(); await getMembroMe({ user: { id: 2 } }, own);
  assert.equal(own.body.foto, '/api/membros/9/foto');
});
test('local photographs are returned with no-store and image content type', async () => {
  const filename = `test_${randomUUID()}.png`;
  const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  try {
    pool.query = async () => select([{ foto: `/uploads/${filename}` }]);
    const res = response(); await getMembroFoto({ params: { id: '9' }, user: { id: 2, perfil: 'Membro' } }, res);
    assert.equal(res.code, 200); assert.deepEqual(res.body, buffer);
    assert.equal(res.headers['Cache-Control'], 'private, no-store');
    assert.equal(res.contentType, 'image/png');
  } finally { await fs.unlink(path.join(uploadDir, filename)); }
});
test('storage rejects traversal and arbitrary remote URLs', async () => {
  for (const url of ['/uploads/../.env', '/uploads/a/b.png', '/uploads/%2e%2e.env']) await assert.rejects(readPhoto(url));
  for (const url of ['https://evil.test/a.png', 'http://store.public.blob.vercel-storage.com/a.png', 'https://user:pass@store.public.blob.vercel-storage.com/a.png', 'https://store.public.blob.vercel-storage.com:123/a.png']) assert.throws(() => photoAccess(url));
  assert.equal(photoAccess('https://store.private.blob.vercel-storage.com/a.png'), 'private');
});
test('invalid photo IDs never query the database', async () => {
  pool.query = async () => { throw new Error('Unexpected query'); };
  for (const id of ['0', 'abc', '1.5', '2147483648']) {
    const res = response(); await getMembroFoto({ params: { id }, user: { id: 2 } }, res); assert.equal(res.code, 400);
  }
});
