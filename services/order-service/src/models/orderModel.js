const { pool } = require('../config/db');

const create = async (conn, userId, pricing, shippingAddress) => {
  const [result] = await conn.query(
    `INSERT INTO orders
       (user_id, status, payment_status, subtotal, tax, shipping_cost, total,
        shipping_full_name, shipping_phone, shipping_line1, shipping_line2,
        shipping_city, shipping_state, shipping_postal_code, shipping_country)
     VALUES (?, 'PENDING', 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, pricing.subtotal, pricing.tax, pricing.shippingCost, pricing.total,
      shippingAddress.fullName, shippingAddress.phone, shippingAddress.line1, shippingAddress.line2 || null,
      shippingAddress.city, shippingAddress.state, shippingAddress.postalCode, shippingAddress.country || 'India',
    ]
  );
  return result.insertId;
};

const insertItems = async (conn, orderId, items) => {
  for (const item of items) {
    await conn.query(
      `INSERT INTO order_items (order_id, product_id, product_name, image_url, unit_price, quantity, subtotal)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderId, item.product_id, item.product_name, item.image_url, item.unit_price, item.quantity, item.unit_price * item.quantity]
    );
  }
};

const updateStatuses = async (orderId, { status, paymentStatus }) => {
  const fields = [];
  const params = [];
  if (status) {
    fields.push('status = ?');
    params.push(status);
  }
  if (paymentStatus) {
    fields.push('payment_status = ?');
    params.push(paymentStatus);
  }
  if (fields.length === 0) return;
  params.push(orderId);
  await pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, params);
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const findItemsByOrderId = async (orderId) => {
  const [rows] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  return rows;
};

const findByUserId = async (userId, { page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, Number(limit), Number(offset)]
  );
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM orders WHERE user_id = ?', [userId]);
  return { rows, total: countRows[0].total };
};

module.exports = { create, insertItems, updateStatuses, findById, findItemsByOrderId, findByUserId };
