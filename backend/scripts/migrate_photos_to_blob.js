import fs from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../config/db.js';
import { savePhoto, detectImage, uploadDir } from '../config/photoStorage.js';

const apply = process.argv.includes('--apply');
try {
  const { rows } = await pool.query("SELECT id, foto FROM membros WHERE foto LIKE '/uploads/%' ORDER BY id");
  // Preflight all referenced files before uploading or changing any record.
  const pending = [];
  for (const member of rows) {
    const filename = member.foto.slice('/uploads/'.length);
    if (filename !== path.basename(filename) || filename.includes('..')) throw new Error(`Caminho inválido no membro ${member.id}.`);
    const buffer = await fs.readFile(path.join(uploadDir, filename));
    if (!detectImage(buffer)) throw new Error(`Fotografia inválida no membro ${member.id}.`);
    pending.push({ ...member, buffer });
  }
  console.log(`${pending.length} fotografias prontas para transferir.`);
  if (!apply) console.log('Verificação concluída. Para transferir: npm run photos:migrate -- --apply');
  else {
    if (!process.env.BLOB_PRIVATE_READ_WRITE_TOKEN) throw new Error('Configure BLOB_PRIVATE_READ_WRITE_TOKEN no .env.');
    const updates = [];
    const client = await pool.connect();
    try {
      for (const photo of pending) {
        const stored = await savePhoto({ buffer: photo.buffer }, photo.id);
        updates.push({ ...photo, stored });
      }
      await client.query('BEGIN');
      for (const update of updates) {
        const result = await client.query('UPDATE membros SET foto = $1 WHERE id = $2 AND foto = $3', [update.stored.url, update.id, update.foto]);
        if (result.rowCount !== 1) throw new Error('Uma fotografia foi alterada entretanto. Repita a transferência.');
      }
      await client.query('COMMIT');
      console.log('Fotografias transferidas e ligações atualizadas. Os ficheiros locais foram preservados.');
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      await Promise.allSettled(updates.map((update) => update.stored.remove()));
      throw error;
    } finally { client.release(); }
  }
} catch (error) {
  console.error('Transferência não concluída:', error.code === 'ENOENT' ? 'Falta uma fotografia referenciada na pasta backend/uploads.' : error.message);
  process.exitCode = 1;
} finally { await pool.end(); }
