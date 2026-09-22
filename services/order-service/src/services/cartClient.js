const axios = require('axios');

const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:5003';
const client = axios.create({ baseURL: CART_SERVICE_URL, timeout: 5000 });

/**
 * Every call forwards the original caller's Authorization header so
 * Cart Service verifies the same JWT and scopes the request to the same
 * user - Order Service never impersonates a user or passes a raw user id.
 */
const getCart = async (authHeader) => {
  try {
    const response = await client.get('/api/cart', { headers: { Authorization: authHeader } });
    return response.data.data;
  } catch (error) {
    const err = new Error('Could not reach the cart service. Please try again.');
    err.statusCode = 503;
    err.cause = error;
    throw err;
  }
};

const clearCart = async (authHeader) => {
  try {
    await client.delete('/api/cart', { headers: { Authorization: authHeader } });
  } catch (error) {
    // Non-fatal: the order has already been placed successfully at this
    // point, so a failure to clear the cart shouldn't fail the checkout -
    // just log it. The user can clear it manually on their next visit.
    console.error(`[order-service] Failed to clear cart after order placement: ${error.message}`);
  }
};

module.exports = { getCart, clearCart };
