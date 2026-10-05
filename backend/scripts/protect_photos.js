import { pool } from '../config/db.js';
import { readPhoto, savePhoto, removePhoto, photoAccess } from '../config/photoStorage.js';

const apply = process.argv.includes('--apply');
try {
  const { rows } = await pool.query('SELECT id, foto FROM membros WHERE foto IS NOT NULL ORDER BY id');
  const pending = [];
  for (const row of rows) {
    if (!row.foto.startsWith('/uploads/') && photoAccess(row.foto) === 'private') continue;
    const { buffer } = await readPhoto(row.foto);
    pending.push({ ...row, buffer });
  }
  console.log(`${pending.length} fotografias verificadas para transferência privada.`);
  if (!apply) console.log('Nenhuma alteração efetuada. Após configurar o Blob privado e publicar o código: npm run photos:protect -- --apply');
  else {
    if (!process.env.BLOB_PRIVATE_READ_WRITE_TOKEN) throw new Error('Configure BLOB_PRIVATE_READ_WRITE_TOKEN.');
    for (const photo of pending) {
      const stored = await savePhoto({ buffer: photo.buffer }, photo.id);
      let updated;
      try {
        updated = await pool.query('UPDATE membros SET foto=$1 WHERE id=$2 AND foto=$3', [stored.url, photo.id, photo.foto]);
      } catch (error) {
        // An interrupted response can hide a committed UPDATE. Keep both files
        // for reconciliation instead of risking deleting a referenced photo.
        console.error(`Membro ${photo.id}: confirmar o estado da ligação antes de limpar ficheiros.`);
        throw error;
      }
      if (updated.rowCount !== 1) {
        await stored.remove();
        throw new Error(`Membro ${photo.id}: fotografia alterada entretanto. Repita a transferência.`);
      }
      await removePhoto(photo.foto).catch(() => console.error(`Membro ${photo.id}: transferência concluída; eliminação da cópia antiga pendente.`));
      console.log(`Membro ${photo.id}: ligação privada guardada.`);
    }
    console.log('Transferência concluída. Verifique as mensagens de limpeza pendente.');
  }
} catch (error) {
  console.error('Transferência interrompida:', error.code ?? error.message);
  process.exitCode = 1;
} finally { await pool.end(); }
