import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();
const db = mysql.createPool({
  host:              process.env.DB_HOST,
  user:              process.env.DB_USER,
  password:          process.env.DB_PASSWORD,
  database:          process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:   10,      
  queueLimit:        0,       
  enableKeepAlive:   true,    
  keepAliveInitialDelay: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Erro ao ligar à base de dados:", err.message);
    process.exit(1); 
  } else {
    console.log("MySQL ligado com sucesso (pool)");
    connection.release();
  }
});

export default db;
