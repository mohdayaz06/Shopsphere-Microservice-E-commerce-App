const { pool } = require('../config/db');

const findAllByUserId = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at ASC',
    [userId]
  );
  return rows;
};

const findById = async (id, userId) => {
  const [rows] = await pool.query('SELECT * FROM addresses WHERE id = ? AND user_id = ? LIMIT 1', [id, userId]);
  return rows[0] || null;
};

const create = async (userId, { label, line1, line2, city, state, postalCode, country, isDefault }) => {
  if (isDefault) {
    await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
  }
  const [result] = await pool.query(
    `INSERT INTO addresses (user_id, label, line1, line2, city, state, postal_code, country, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, label || 'Home', line1, line2 || null, city, state, postalCode, country || 'India', isDefault ? 1 : 0]
  );
  return findById(result.insertId, userId);
};

const remove = async (id, userId) => {
  const [result] = await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
};

module.exports = { findAllByUserId, findById, create, remove };
