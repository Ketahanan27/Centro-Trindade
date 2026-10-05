import { pool } from '../config/db.js';

try {
  await pool.query('ALTER TABLE utilizadores ADD COLUMN IF NOT EXISTS ultimo_acesso timestamp without time zone');
  console.log('Estrutura PostgreSQL preparada: ultimo_acesso disponível.');
} catch (error) {
  console.error('Falha ao preparar PostgreSQL:', error.code ?? 'erro');
  process.exitCode = 1;
} finally { await pool.end(); }
