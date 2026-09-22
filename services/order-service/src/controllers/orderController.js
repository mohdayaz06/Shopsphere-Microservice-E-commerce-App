const asyncHandler = require('express-async-handler');
const orderService = require('../services/orderService');

const placeOrder = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const order = await orderService.placeOrder(req.user.id, req.body, authHeader);
  res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
});

const listOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { rows, total } = await orderService.listMyOrders(req.user.id, { page: Number(page), limit: Number(limit) });
  res.json({
    success: true,
    count: rows.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: rows,
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderDetail(Number(req.params.id), req.user.id);
  res.json({ success: true, data: order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(Number(req.params.id), req.user.id, req.body.status);
  res.json({ success: true, data: order });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const order = await orderService.cancelOrder(Number(req.params.id), req.user.id, authHeader);
  res.json({ success: true, message: 'Order cancelled', data: order });
});

module.exports = { placeOrder, listOrders, getOrderById, updateOrderStatus, cancelOrder };
