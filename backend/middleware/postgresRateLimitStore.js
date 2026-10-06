import { createHash } from 'node:crypto';
import { pool } from '../config/db.js';

export class PostgresRateLimitStore {
  constructor(prefix, database = pool) { this.prefix = prefix; this.database = database; this.localKeys = false; this.cleanupCount = 0; }
  init(options) { this.windowMs = options.windowMs; }
  key(key) { return createHash('sha256').update(`${this.prefix}:${key}`).digest('hex'); }
  async increment(key) {
    try {
      const result = await this.database.query(`INSERT INTO rate_limit_counters (key_hash,hits,reset_at)
        VALUES ($1,1,clock_timestamp() + $2::double precision * interval '1 millisecond')
        ON CONFLICT (key_hash) DO UPDATE SET
          hits = CASE WHEN rate_limit_counters.reset_at <= clock_timestamp() THEN 1 ELSE LEAST(rate_limit_counters.hits + 1, 1000000000) END,
          reset_at = CASE WHEN rate_limit_counters.reset_at <= clock_timestamp() THEN clock_timestamp() + $2::double precision * interval '1 millisecond' ELSE rate_limit_counters.reset_at END
        RETURNING hits, reset_at`, [this.key(key), this.windowMs]);
      if (++this.cleanupCount % 1000 === 0) {
        await this.database.query("DELETE FROM rate_limit_counters WHERE key_hash IN (SELECT key_hash FROM rate_limit_counters WHERE reset_at < clock_timestamp() - interval '1 day' LIMIT 1000)").catch(() => {});
      }
      return { totalHits: result.rows[0].hits, resetTime: new Date(result.rows[0].reset_at) };
    } catch {
      const error = new Error('Não foi possível verificar o limite de pedidos.');
      error.code = 'RATE_LIMIT_STORAGE';
      throw error;
    }
  }
  async decrement(key) { await this.database.query('UPDATE rate_limit_counters SET hits=GREATEST(hits-1,1) WHERE key_hash=$1', [this.key(key)]); }
  async resetKey(key) { await this.database.query('DELETE FROM rate_limit_counters WHERE key_hash=$1', [this.key(key)]); }
}
