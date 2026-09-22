const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  decimalNumbers: true,
});

const testConnection = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    console.log(`[db] product-service connected to MySQL at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  } finally {
    conn.release();
  }
};

module.exports = { pool, testConnection };
