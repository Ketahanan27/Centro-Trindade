import pg from "pg";
import dotenv from "dotenv";
import { attachDatabasePool } from "@vercel/functions";

dotenv.config({ quiet: true });

/*
|--------------------------------------------------------------------------
| Pool de ligações PostgreSQL
|--------------------------------------------------------------------------
|
| DATABASE_URL contém a ligação Neon. TLS verifica o certificado do servidor.
| As datas sem hora mantêm o formato YYYY-MM-DD e os decimais mantêm precisão.
|
*/
if (!process.env.DATABASE_URL) throw new Error("Configure DATABASE_URL com a ligação PostgreSQL no .env.");
const types = new pg.TypeOverrides();
pg.defaults.parseInputDatesAsUTC = true;
types.setTypeParser(1082, (value) => value);
types.setTypeParser(1114, (value) => new Date(value.replace(" ", "T") + "Z"));
types.setTypeParser(20, (value) => {
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : value;
});
const connectionUrl = new URL(process.env.DATABASE_URL);
if (connectionUrl.searchParams.get("sslmode") === "require") connectionUrl.searchParams.set("sslmode", "verify-full");
export const pool = new pg.Pool({
  connectionString: connectionUrl.toString(), types, max: 5,
  idleTimeoutMillis: 10000, connectionTimeoutMillis: 15000,
  options: "-c timezone=UTC",
});
pool.on("error", (error) => console.error("[PostgreSQL] Erro numa ligação inativa:", error.code ?? "erro"));
if (process.env.VERCEL) attachDatabasePool(pool);

// Existing callback controllers receive rows for SELECT and the PostgreSQL
// result (rowCount and RETURNING rows) for writes.
const db = {
  query(sql, params, callback) {
    if (typeof params === "function") { callback = params; params = []; }
    const pending = pool.query(sql, params ?? []).then((result) => result.command === "SELECT" ? result.rows : result);
    if (!callback) return pending;
    pending.then((result) => callback(null, result), (error) => callback(error));
  },
};

export default db;
