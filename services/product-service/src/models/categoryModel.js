const { pool } = require('../config/db');

const findAll = async () => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return rows;
};

const findBySlug = async (slug) => {
  const [rows] = await pool.query('SELECT * FROM categories WHERE slug = ? LIMIT 1', [slug]);
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

module.exports = { findAll, findBySlug, findById };
