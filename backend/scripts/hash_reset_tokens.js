import { pool } from '../config/db.js';
// Run immediately after publishing the hash-only reset consumer. Existing
// emailed links keep their original token; only its database representation changes.
try {
  const result = await pool.query("UPDATE password_resets SET token = 'sha256:' || encode(sha256(convert_to(token, 'UTF8')), 'hex') WHERE token NOT LIKE 'sha256:%'");
  console.log(`${result.rowCount} tokens antigos convertidos em hashes. Links e validade preservados.`);
} catch (error) { console.error('Conversão de tokens falhou:', error.code ?? 'erro'); process.exitCode = 1; }
finally { await pool.end(); }
