import { pool } from '../config/db.js';

export async function comTransacao(executar) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await executar(client);
    await client.query('COMMIT');
    return resultado;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}
