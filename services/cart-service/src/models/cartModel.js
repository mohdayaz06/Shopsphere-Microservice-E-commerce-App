const { pool } = require('../config/db');

/** Finds the user's cart, creating one if it doesn't exist yet. */
const findOrCreateCart = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM carts WHERE user_id = ? LIMIT 1', [userId]);
  if (rows[0]) return rows[0];

  const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
  const [created] = await pool.query('SELECT * FROM carts WHERE id = ?', [result.insertId]);
  return created[0];
};

const findItems = async (cartId) => {
  const [rows] = await pool.query(
    'SELECT * FROM cart_items WHERE cart_id = ? ORDER BY created_at ASC',
    [cartId]
  );
  return rows;
};

const findItem = async (cartId, productId) => {
  const [rows] = await pool.query(
    'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1',
    [cartId, productId]
  );
  return rows[0] || null;
};

/** Adds a product to the cart, or increases quantity if it's already there. */
const upsertItem = async (cartId, { productId, productName, unitPrice, imageUrl, quantity }) => {
  const existing = await findItem(cartId, productId);

  if (existing) {
    await pool.query(
      'UPDATE cart_items SET quantity = quantity + ?, unit_price = ? WHERE id = ?',
      [quantity, unitPrice, existing.id]
    );
  } else {
    await pool.query(
      `INSERT INTO cart_items (cart_id, product_id, product_name, unit_price, image_url, quantity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cartId, productId, productName, unitPrice, imageUrl, quantity]
    );
  }
  await pool.query('UPDATE carts SET updated_at = NOW() WHERE id = ?', [cartId]);
  return findItem(cartId, productId);
};

const setItemQuantity = async (cartId, productId, quantity) => {
  await pool.query(
    'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?',
    [quantity, cartId, productId]
  );
  await pool.query('UPDATE carts SET updated_at = NOW() WHERE id = ?', [cartId]);
  return findItem(cartId, productId);
};

const removeItem = async (cartId, productId) => {
  const [result] = await pool.query(
    'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cartId, productId]
  );
  await pool.query('UPDATE carts SET updated_at = NOW() WHERE id = ?', [cartId]);
  return result.affectedRows > 0;
};

const clearCart = async (cartId) => {
  await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  await pool.query('UPDATE carts SET updated_at = NOW() WHERE id = ?', [cartId]);
};

module.exports = { findOrCreateCart, findItems, findItem, upsertItem, setItemQuantity, removeItem, clearCart };
