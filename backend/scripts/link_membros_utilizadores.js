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

  const [cols] = await conn.query("SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = 'membros' AND column_name = 'utilizador_id'", [process.env.DB_NAME]);
  if (cols.length === 0) {
    console.log('Adicionando coluna utilizador_id em membros...');
    await conn.execute("ALTER TABLE membros ADD COLUMN utilizador_id INT DEFAULT NULL AFTER id");
  } else {
    console.log('Coluna utilizador_id já existe.');
  }

  console.log('Atualizando valores de utilizador_id com base no email...');
  await conn.execute("UPDATE membros m JOIN utilizadores u ON u.email = m.email SET m.utilizador_id = u.id WHERE m.utilizador_id IS NULL AND u.email IS NOT NULL");

  const [fks] = await conn.query("SELECT CONSTRAINT_NAME FROM information_schema.table_constraints WHERE table_schema = ? AND table_name = 'membros' AND constraint_type = 'FOREIGN KEY'", [process.env.DB_NAME]);
  const fkExists = fks.some(r => String(r.CONSTRAINT_NAME).toLowerCase().includes('utilizador'));
  if (!fkExists) {
    try {
      console.log('Adicionando constraint fk_membros_utilizador...');
      await conn.execute('ALTER TABLE membros ADD CONSTRAINT fk_membros_utilizador FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE SET NULL');
    } catch (e) {
      console.warn('Não foi possível criar a constraint (provavelmente já existe):', e.message);
    }
  } else {
    console.log('Constraint de foreign key já existe.');
  }

  console.log('Finalizado.');
  await conn.end();
})().catch(e=>{ console.error(e); process.exit(1); });
