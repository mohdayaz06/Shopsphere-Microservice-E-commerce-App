const asyncHandler = require('express-async-handler');
const paymentModel = require('../models/paymentModel');
const paymentSimulator = require('../services/paymentSimulator');

const createPayment = asyncHandler(async (req, res) => {
  const { orderId, amount, method } = req.body;
  const payment = await paymentSimulator.processPayment({
    orderId,
    userId: req.user.id,
    amount,
    method,
  });

  const statusCode = payment.status === 'FAILED' ? 402 : 201;
  res.status(statusCode).json({ success: payment.status !== 'FAILED', data: payment });
});

const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await paymentModel.findById(Number(req.params.id));
  if (!payment || payment.user_id !== req.user.id) {
    res.status(404);
    throw new Error('Payment not found');
  }
  res.json({ success: true, data: payment });
});

const getPaymentsByOrder = asyncHandler(async (req, res) => {
  const payments = await paymentModel.findByOrderId(Number(req.params.orderId));
  const owned = payments.filter((p) => p.user_id === req.user.id);
  res.json({ success: true, count: owned.length, data: owned });
});

const listMyPayments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const payments = await paymentModel.findByUserId(req.user.id, { page, limit });
  res.json({ success: true, count: payments.length, data: payments });
});

const refundPayment = asyncHandler(async (req, res) => {
  const payment = await paymentModel.findById(Number(req.params.id));
  if (!payment || payment.user_id !== req.user.id) {
    res.status(404);
    throw new Error('Payment not found');
  }
  const refunded = await paymentSimulator.refundPayment(payment.id);
  res.json({ success: true, data: refunded });
});

module.exports = { createPayment, getPaymentById, getPaymentsByOrder, listMyPayments, refundPayment };
