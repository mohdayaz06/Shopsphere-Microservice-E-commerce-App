const asyncHandler = require('express-async-handler');
const cartService = require('../services/cartService');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.json({ success: true, data: cart });
});

const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Item added to cart', data: cart });
});

const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItemQuantity(req.user.id, Number(req.params.productId), req.body.quantity);
  res.json({ success: true, data: cart });
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, Number(req.params.productId));
  res.json({ success: true, data: cart });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  res.json({ success: true, data: cart });
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
