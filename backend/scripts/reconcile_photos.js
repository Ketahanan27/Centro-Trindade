import { pool } from '../config/db.js';
import { list } from '@vercel/blob';
import { removePhoto } from '../config/photoStorage.js';
import { reconcilePhotos } from '../utils/photoReconciliation.js';

try {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--apply')) throw new Error('Use photos:reconcile ou photos:reconcile -- --apply.');
  const token = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
  if (!token) throw new Error('Configure BLOB_PRIVATE_READ_WRITE_TOKEN.');
  const apply = args.includes('--apply');
  const summary = await reconcilePhotos({ database: pool, listPage: (options) => list({ ...options, token }), remove: removePhoto, apply });
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'analysis', ...summary }));
  if (!apply) console.log('Análise concluída, sem eliminar ficheiros. --apply elimina até 100 fotografias órfãs com pelo menos 24 horas.');
  if (summary.failed) process.exitCode = 1;
} catch (error) {
  console.error('Reconciliação interrompida:', error.code ?? 'erro');
  process.exitCode = 1;
} finally { await pool.end(); }
