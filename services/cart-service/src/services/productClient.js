const axios = require('axios');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';

const client = axios.create({
  baseURL: PRODUCT_SERVICE_URL,
  timeout: 5000,
});

/**
 * Fetches a single product from Product Service. Returns null if the
 * product doesn't exist (404) rather than throwing, so callers can give a
 * clean "product not found" response instead of a raw 500.
 *
 * This is the cart service's one point of coupling to product-service -
 * everywhere else in this service, a cart_items row is treated as a
 * self-contained snapshot (name/price captured at add-to-cart time).
 */
const getProduct = async (productId) => {
  try {
    const response = await client.get(`/api/products/${productId}`);
    return response.data.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    const err = new Error('Could not reach the product catalogue. Please try again.');
    err.statusCode = 503;
    err.cause = error;
    throw err;
  }
};

module.exports = { getProduct };
