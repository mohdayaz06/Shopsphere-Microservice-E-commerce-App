const cartModel = require('../models/cartModel');
const productClient = require('./productClient');

const toCartSummary = (items) => {
  const subtotal = items.reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0);
  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: Math.round(subtotal * 100) / 100,
  };
};

const getCart = async (userId) => {
  const cart = await cartModel.findOrCreateCart(userId);
  const items = await cartModel.findItems(cart.id);
  return { cartId: cart.id, ...toCartSummary(items) };
};

/**
 * Adds a product to the cart. Calls out to Product Service first to
 * confirm the product exists, is active, and has enough stock - the cart
 * never trusts a client-supplied price or product name.
 */
const addItem = async (userId, { productId, quantity = 1 }) => {
  const product = await productClient.getProduct(productId);
  if (!product || product.status !== 'active') {
    const err = new Error('Product not found or no longer available');
    err.statusCode = 404;
    throw err;
  }
  if (product.stock_quantity < quantity) {
    const err = new Error(`Only ${product.stock_quantity} unit(s) of "${product.name}" are in stock`);
    err.statusCode = 422;
    throw err;
  }

  const cart = await cartModel.findOrCreateCart(userId);
  await cartModel.upsertItem(cart.id, {
    productId: product.id,
    productName: product.name,
    unitPrice: product.final_price,
    imageUrl: product.image_url,
    quantity,
  });

  const items = await cartModel.findItems(cart.id);
  return { cartId: cart.id, ...toCartSummary(items) };
};

const updateItemQuantity = async (userId, productId, quantity) => {
  const cart = await cartModel.findOrCreateCart(userId);
  const existing = await cartModel.findItem(cart.id, productId);
  if (!existing) {
    const err = new Error('This product is not in your cart');
    err.statusCode = 404;
    throw err;
  }

  if (quantity <= 0) {
    await cartModel.removeItem(cart.id, productId);
  } else {
    // Re-check stock on every quantity change - it may have dropped since the item was added.
    const product = await productClient.getProduct(productId);
    if (product && product.stock_quantity < quantity) {
      const err = new Error(`Only ${product.stock_quantity} unit(s) of "${product.name}" are in stock`);
      err.statusCode = 422;
      throw err;
    }
    await cartModel.setItemQuantity(cart.id, productId, quantity);
  }

  const items = await cartModel.findItems(cart.id);
  return { cartId: cart.id, ...toCartSummary(items) };
};

const removeItem = async (userId, productId) => {
  const cart = await cartModel.findOrCreateCart(userId);
  await cartModel.removeItem(cart.id, productId);
  const items = await cartModel.findItems(cart.id);
  return { cartId: cart.id, ...toCartSummary(items) };
};

const clearCart = async (userId) => {
  const cart = await cartModel.findOrCreateCart(userId);
  await cartModel.clearCart(cart.id);
  return { cartId: cart.id, items: [], itemCount: 0, subtotal: 0 };
};

module.exports = { getCart, addItem, updateItemQuantity, removeItem, clearCart };
