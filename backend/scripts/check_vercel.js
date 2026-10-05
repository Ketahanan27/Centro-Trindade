import assert from 'node:assert/strict';
import fs from 'node:fs';
import jwt from 'jsonwebtoken';

process.env.VERCEL = '1';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
process.env.JWT_SECRET = 'serverless-test-secret-never-used-in-production';
process.env.BLOB_READ_WRITE_TOKEN = '';
process.env.BLOB_PRIVATE_READ_WRITE_TOKEN = '';
const { default: app } = await import('../../api/index.js');
const { pool } = await import('../config/db.js');
// Isolated fixture: no database or storage write is performed by these checks.
pool.query = async (sql, params) => {
  assert.match(sql, /^SELECT id, perfil, estado, session_version FROM utilizadores/);
  assert.equal(params[0], 1);
  return { command: 'SELECT', rows: [{ id: 1, perfil: 'Membro', estado: 'Ativo', session_version: 0 }] };
};
const server = app.listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
try {
  assert.equal((await fetch(base + '/')).status, 200);
  assert.equal((await fetch(base + '/api/auth/users')).status, 401);
  assert.equal((await fetch(base + '/api/membros/1/foto')).status, 401);
  assert.equal((await fetch(base + '/api/eventos/internos')).status, 401);
  const missing = await fetch(base + '/api/rota-inexistente');
  assert.equal(missing.status, 404);
  assert.match(missing.headers.get('content-type'), /application\/json/);
  assert.equal((await fetch(base + '/uploads/ficheiro-inexistente.png')).status, 404);
  const token = jwt.sign({ id: 1, perfil: 'Membro', session_version: 0 }, process.env.JWT_SECRET, { expiresIn: '1m', algorithm: 'HS256' });
  async function upload(buffer, type) {
    const form = new FormData();
    form.append('foto', new Blob([buffer], { type }), 'teste.png');
    return fetch(base + '/api/membros/me/foto', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  }
  assert.equal((await upload(Buffer.from('<html>ficheiro falso</html>'), 'image/png')).status, 400);
  assert.equal((await upload(Buffer.from('texto'), 'text/plain')).status, 400);
  assert.equal((await upload(Buffer.alloc(2 * 1024 * 1024 + 1), 'image/png')).status, 413);
  for (const file of fs.readdirSync('dist/assets').filter((name) => name.endsWith('.js'))) {
    assert.doesNotMatch(fs.readFileSync(`dist/assets/${file}`, 'utf8'), /https?:\/\/(localhost|127\.0\.0\.1):5000/);
  }
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  assert.deepEqual(config.regions, ['fra1']);
  assert.equal(config.rewrites[0].source, '/api/:path*');
  console.log('Entrada serverless, autenticação, erros de upload e bundle sem API localhost verificados.');
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await pool.end();
}
