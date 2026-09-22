/**
 * Central map of "which service owns which path prefix". Every other part
 * of the gateway (the proxy setup and the aggregated health check) is
 * driven off this single list, so adding a new microservice later is a
 * one-line change here rather than a change in multiple places.
 */
const services = [
  { name: 'user-service', pathPrefix: '/api/users', target: process.env.USER_SERVICE_URL || 'http://localhost:5001' },
  { name: 'product-service', pathPrefix: '/api/products', target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002' },
  { name: 'product-service', pathPrefix: '/api/categories', target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002' },
  { name: 'cart-service', pathPrefix: '/api/cart', target: process.env.CART_SERVICE_URL || 'http://localhost:5003' },
  { name: 'order-service', pathPrefix: '/api/orders', target: process.env.ORDER_SERVICE_URL || 'http://localhost:5004' },
  { name: 'payment-service', pathPrefix: '/api/payments', target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5005' },
];

module.exports = services;
