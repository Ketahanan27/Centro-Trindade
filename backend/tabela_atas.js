import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

(async function main(){
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [tabelas] = await conn.query(
    "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? AND table_name = 'atas'",
    [process.env.DB_NAME]
  );

  if (tabelas.length === 0) {
    console.log('Criando tabela atas...');
    await conn.execute(`
      CREATE TABLE atas (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        titulo        VARCHAR(255) NOT NULL,
        data          DATE NOT NULL,
        hora          TIME NOT NULL,
        local         VARCHAR(255) NULL,
        participantes TEXT NULL,
        resumo        TEXT NULL,
        decisoes      TEXT NULL,
        observacoes   TEXT NULL,
        created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela atas criada com sucesso.');
  } else {
    console.log('Tabela atas já existe.');
  }

  console.log('Finalizado.');
  await conn.end();
})().catch(e => { console.error(e); process.exit(1); });