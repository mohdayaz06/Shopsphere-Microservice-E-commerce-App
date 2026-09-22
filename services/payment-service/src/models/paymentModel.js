const { pool } = require('../config/db');

const create = async ({ orderId, userId, amount, method, status, maskedReference, failureReason, transactionRef }) => {
  const [result] = await pool.query(
    `INSERT INTO payments (order_id, user_id, amount, method, status, masked_reference, failure_reason, transaction_ref)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [orderId, userId, amount, method, status, maskedReference || null, failureReason || null, transactionRef]
  );
  return findById(result.insertId);
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM payments WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const findByOrderId = async (orderId) => {
  const [rows] = await pool.query('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC', [orderId]);
  return rows;
};

const findByUserId = async (userId, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, Number(limit), Number(offset)]
  );
  return rows;
};

const updateStatus = async (id, status, extra = {}) => {
  const fields = ['status = ?'];
  const params = [status];
  if (extra.failureReason !== undefined) {
    fields.push('failure_reason = ?');
    params.push(extra.failureReason);
  }
  params.push(id);
  await pool.query(`UPDATE payments SET ${fields.join(', ')} WHERE id = ?`, params);
  return findById(id);
};

module.exports = { create, findById, findByOrderId, findByUserId, updateStatus };
