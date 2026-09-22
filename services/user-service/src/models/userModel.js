const { pool } = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, phone, status, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

const create = async ({ fullName, email, phone, passwordHash }) => {
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
    [fullName, email, phone || null, passwordHash]
  );
  return findById(result.insertId);
};

const updateProfile = async (id, { fullName, phone }) => {
  await pool.query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [fullName, phone || null, id]);
  return findById(id);
};

module.exports = { findByEmail, findById, create, updateProfile };
