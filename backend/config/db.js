import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();
const db = mysql.createPool({
  host:              process.env.DB_HOST,
  user:              process.env.DB_USER,
  password:          process.env.DB_PASSWORD,
  database:          process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:   10,      // máximo de conexões simultâneas
  queueLimit:        0,       // sem limite na fila de espera
  enableKeepAlive:   true,    // mantém conexões vivas
  keepAliveInitialDelay: 0,
});

// Verificar ligação inicial
db.getConnection((err, connection) => {
  if (err) {
    console.error("Erro ao ligar à base de dados:", err.message);
    process.exit(1); // Para o servidor se não houver DB — evita arrancar sem BD
  } else {
    console.log("MySQL ligado com sucesso (pool)");
    connection.release();
  }
});

export default db;