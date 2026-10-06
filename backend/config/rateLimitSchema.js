export const RATE_LIMIT_SQL = `CREATE TABLE IF NOT EXISTS rate_limit_counters (
  key_hash varchar(64) PRIMARY KEY,
  hits integer NOT NULL CHECK (hits > 0),
  reset_at timestamptz NOT NULL
); CREATE INDEX IF NOT EXISTS rate_limit_expiry ON rate_limit_counters (reset_at);`;
