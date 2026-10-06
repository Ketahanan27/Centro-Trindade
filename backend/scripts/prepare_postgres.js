import { pool } from '../config/db.js';
import { TESOURARIA_AUDITORIA_SQL } from '../config/tesourariaSchema.js';
import { RATE_LIMIT_SQL } from '../config/rateLimitSchema.js';

try {
  await pool.query('ALTER TABLE utilizadores ADD COLUMN IF NOT EXISTS ultimo_acesso timestamp without time zone');
  await pool.query('ALTER TABLE utilizadores ADD COLUMN IF NOT EXISTS session_version integer NOT NULL DEFAULT 0');
  await pool.query('ALTER TABLE utilizadores ADD COLUMN IF NOT EXISTS convite_pendente boolean NOT NULL DEFAULT false');
  await pool.query('ALTER TABLE eventos ADD COLUMN IF NOT EXISTS publico boolean NOT NULL DEFAULT false');
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS utilizadores_email_normalizado_unico ON utilizadores (lower(trim(email)))');
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS membros_conta_unica ON membros (utilizador_id) WHERE utilizador_id IS NOT NULL');
  await pool.query(TESOURARIA_AUDITORIA_SQL);
  await pool.query(RATE_LIMIT_SQL);
  console.log('Estrutura PostgreSQL preparada: sessões, associação de membros e histórico da tesouraria disponíveis.');
} catch (error) {
  console.error('Falha ao preparar PostgreSQL:', error.code ?? 'erro');
  process.exitCode = 1;
} finally { await pool.end(); }
