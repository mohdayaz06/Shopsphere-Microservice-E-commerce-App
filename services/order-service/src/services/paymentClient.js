const axios = require('axios');

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5005';
const client = axios.create({ baseURL: PAYMENT_SERVICE_URL, timeout: 8000 });

/**
 * Initiates payment for an order. Payment Service returns 402 (not 2xx)
 * when the simulated payment fails, so axios throws - we catch that
 * specific case and return the payment record anyway (status FAILED)
 * rather than treating it as a transport error, since it's a normal,
 * expected business outcome.
 */
const createPayment = async ({ orderId, amount, method }, authHeader) => {
  try {
    const response = await client.post(
      '/api/payments',
      { orderId, amount, method },
      { headers: { Authorization: authHeader } }
    );
    return response.data.data;
  } catch (error) {
    if (error.response && error.response.status === 402) {
      return error.response.data.data; // payment record with status FAILED
    }
    const err = new Error('Could not reach the payment service. Please try again.');
    err.statusCode = 503;
    err.cause = error;
    throw err;
  }
};

const refundPayment = async (paymentId, authHeader) => {
  try {
    const response = await client.post(`/api/payments/${paymentId}/refund`, {}, { headers: { Authorization: authHeader } });
    return response.data.data;
  } catch (error) {
    console.error(`[order-service] Failed to refund payment ${paymentId}: ${error.message}`);
    return null;
  }
};

/** Looks up payments for an order - used when cancelling to find what (if anything) needs refunding. */
const findByOrderId = async (orderId, authHeader) => {
  try {
    const response = await client.get(`/api/payments/order/${orderId}`, { headers: { Authorization: authHeader } });
    return response.data.data;
  } catch (error) {
    console.error(`[order-service] Failed to look up payments for order ${orderId}: ${error.message}`);
    return [];
  }
};

module.exports = { createPayment, refundPayment, findByOrderId };
