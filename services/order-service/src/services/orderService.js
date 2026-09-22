const { pool } = require('../config/db');
const orderModel = require('../models/orderModel');
const cartClient = require('./cartClient');
const productClient = require('./productClient');
const paymentClient = require('./paymentClient');

const round2 = (n) => Math.round(n * 100) / 100;

const calculatePricing = (subtotal) => {
  const taxRate = Number(process.env.TAX_RATE || 0.05);
  const freeShippingThreshold = Number(process.env.FREE_SHIPPING_THRESHOLD || 999);
  const flatShippingCost = Number(process.env.FLAT_SHIPPING_COST || 79);

  const tax = round2(subtotal * taxRate);
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : flatShippingCost;
  const total = round2(subtotal + tax + shippingCost);

  return { subtotal: round2(subtotal), tax, shippingCost, total };
};

/**
 * Places an order from the user's current cart. This is a SAGA, not a
 * distributed transaction - there is no single commit/rollback across
 * three separate databases (that's the whole point of microservices
 * having their own data). Instead, each step either succeeds and moves
 * on, or fails and triggers an explicit COMPENSATING action to undo what
 * already happened:
 *
 *   1. Read the cart from Cart Service (read-only, nothing to undo)
 *   2. Reserve stock in Product Service, one item at a time
 *        -> on failure: restock everything reserved so far (compensate)
 *   3. Create the order + order_items locally (this service's own DB -
 *      a normal local transaction, safe to roll back)
 *   4. Charge the order via Payment Service
 *        -> on failure: restock every item (compensate step 2) and mark
 *           the order CANCELLED instead of deleting it, so there's an
 *           audit trail of the failed attempt
 *   5. Clear the cart in Cart Service (best-effort, non-fatal if it fails)
 */
const placeOrder = async (userId, { shippingAddress, paymentMethod }, authHeader) => {
  const cart = await cartClient.getCart(authHeader);
  if (!cart || cart.items.length === 0) {
    const err = new Error('Your cart is empty');
    err.statusCode = 400;
    throw err;
  }

  // --- Step 2: reserve stock for every item, tracking what succeeded so
  // we can undo it if a later item in the same cart fails. ---
  const reserved = [];
  for (const item of cart.items) {
    const ok = await productClient.reserveStock(item.product_id, item.quantity);
    if (!ok) {
      for (const done of reserved) {
        await productClient.restockProduct(done.product_id, done.quantity);
      }
      const err = new Error(`"${item.product_name}" no longer has enough stock. Please update your cart.`);
      err.statusCode = 422;
      throw err;
    }
    reserved.push(item);
  }

  const pricing = calculatePricing(cart.subtotal);

  // --- Step 3: create the order locally (this service's own transaction) ---
  const conn = await pool.getConnection();
  let orderId;
  try {
    await conn.beginTransaction();
    orderId = await orderModel.create(conn, userId, pricing, shippingAddress);
    await orderModel.insertItems(conn, orderId, cart.items);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    // Order row failed to persist at all - undo the stock reservation too.
    for (const item of cart.items) {
      await productClient.restockProduct(item.product_id, item.quantity);
    }
    throw err;
  } finally {
    conn.release();
  }

  // --- Step 4: charge the order ---
  const payment = await paymentClient.createPayment(
    { orderId, amount: pricing.total, method: paymentMethod },
    authHeader
  );

  if (payment.status === 'FAILED') {
    await orderModel.updateStatuses(orderId, { status: 'CANCELLED', paymentStatus: 'FAILED' });
    for (const item of cart.items) {
      await productClient.restockProduct(item.product_id, item.quantity);
    }
    // Cart is deliberately left intact so the user can retry checkout
    // (e.g. with a different payment method) without re-adding items.
    const err = new Error(`Payment failed: ${payment.failure_reason || 'please try a different payment method'}`);
    err.statusCode = 402;
    err.orderId = orderId;
    throw err;
  }

  // SUCCESS (card/UPI/net banking) or PENDING (cash on delivery) both mean
  // the order is confirmed - the difference is only when money changes hands.
  await orderModel.updateStatuses(orderId, { status: 'CONFIRMED', paymentStatus: payment.status });

  // --- Step 5: best-effort cart cleanup ---
  await cartClient.clearCart(authHeader);

  return getOrderDetail(orderId, userId);
};

const getOrderDetail = async (orderId, userId) => {
  const order = await orderModel.findById(orderId);
  if (!order || order.user_id !== userId) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  const items = await orderModel.findItemsByOrderId(orderId);
  return { ...order, items };
};

const listMyOrders = async (userId, query) => {
  const { rows, total } = await orderModel.findByUserId(userId, query);
  return { rows, total };
};

const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING'];

const cancelOrder = async (orderId, userId, authHeader) => {
  const order = await orderModel.findById(orderId);
  if (!order || order.user_id !== userId) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    const err = new Error(`An order that is already ${order.status.toLowerCase()} cannot be cancelled`);
    err.statusCode = 409;
    throw err;
  }

  const items = await orderModel.findItemsByOrderId(orderId);
  for (const item of items) {
    await productClient.restockProduct(item.product_id, item.quantity);
  }

  if (order.payment_status === 'SUCCESS') {
    const payments = await paymentClient.findByOrderId(orderId, authHeader);
    const successfulPayment = payments.find((p) => p.status === 'SUCCESS');
    if (successfulPayment) {
      await paymentClient.refundPayment(successfulPayment.id, authHeader);
    }
  }

  await orderModel.updateStatuses(orderId, {
    status: 'CANCELLED',
    paymentStatus: order.payment_status === 'SUCCESS' ? 'REFUNDED' : order.payment_status,
  });

  return getOrderDetail(orderId, userId);
};

const updateOrderStatus = async (orderId, userId, status) => {
  const order = await orderModel.findById(orderId);
  if (!order || order.user_id !== userId) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  await orderModel.updateStatuses(orderId, { status });
  return getOrderDetail(orderId, userId);
};

module.exports = { placeOrder, getOrderDetail, listMyOrders, cancelOrder, updateOrderStatus };
