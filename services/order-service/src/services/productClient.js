const axios = require('axios');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';
const client = axios.create({ baseURL: PRODUCT_SERVICE_URL, timeout: 5000 });

const getProduct = async (productId) => {
  try {
    const response = await client.get(`/api/products/${productId}`);
    return response.data.data;
  } catch (error) {
    if (error.response && error.response.status === 404) return null;
    const err = new Error('Could not reach the product catalogue. Please try again.');
    err.statusCode = 503;
    err.cause = error;
    throw err;
  }
};

/**
 * Decrements stock by `quantity` for one product. Returns true on success,
 * false if the product didn't have enough stock (product-service's
 * decrementStock query is atomic - see productModel.decrementStock).
 */
const reserveStock = async (productId, quantity) => {
  try {
    await client.patch(`/api/products/${productId}/stock`, { quantity: -quantity });
    return true;
  } catch (error) {
    if (error.response && error.response.status === 409) return false;
    throw error;
  }
};

/**
 * Compensating action: puts stock back for a product. Used when an order
 * fails partway through checkout (e.g. payment declined, or a later item
 * in the cart turned out to be out of stock) - this is the "undo" half of
 * the saga pattern implemented in orderService.placeOrder.
 */
const restockProduct = async (productId, quantity) => {
  try {
    await client.patch(`/api/products/${productId}/stock`, { quantity });
  } catch (error) {
    console.error(`[order-service] Failed to restock product ${productId}: ${error.message}`);
  }
};

module.exports = { getProduct, reserveStock, restockProduct };
