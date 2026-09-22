const asyncHandler = require('express-async-handler');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const toSlug = require('../utils/slugify');

const listProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, featured, newArrival, sort, page, limit } = req.query;

  const result = await productModel.findAll({
    search,
    categorySlug: category,
    minPrice,
    maxPrice,
    featured,
    newArrival,
    sort,
    page,
    limit,
  });

  res.json({
    success: true,
    count: result.rows.length,
    total: result.total,
    page: result.page,
    pages: Math.ceil(result.total / result.limit),
    data: result.rows,
  });
});

/** GET /api/products/search?q= - a thin, explicit alias over the same search logic. */
const searchProducts = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;
  const result = await productModel.findAll({ search: q, page, limit });
  res.json({
    success: true,
    count: result.rows.length,
    total: result.total,
    page: result.page,
    pages: Math.ceil(result.total / result.limit),
    data: result.rows,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productModel.findById(Number(req.params.id));
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const related = await productModel.findRelated(product.id, product.category_id);
  res.json({ success: true, data: { ...product, relatedProducts: related } });
});

const createProduct = asyncHandler(async (req, res) => {
  const slug = toSlug(req.body.name);
  const product = await productModel.create({ ...req.body, slug });
  res.status(201).json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const existing = await productModel.findById(Number(req.params.id));
  if (!existing) {
    res.status(404);
    throw new Error('Product not found');
  }
  const payload = { ...req.body };
  if (payload.name) payload.slug = toSlug(payload.name);
  const updated = await productModel.update(existing.id, payload);
  res.json({ success: true, data: updated });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const deleted = await productModel.remove(Number(req.params.id));
  if (!deleted) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, message: 'Product discontinued', data: {} });
});

const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryModel.findAll();
  res.json({ success: true, count: categories.length, data: categories });
});

/**
 * Internal endpoint used by order-service (via the API Gateway or direct
 * service-to-service call) to reserve stock at order-creation time.
 * Not exposed as a customer-facing feature.
 */
const adjustStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body; // negative = decrement, positive = increment/restock
  const productId = Number(req.params.id);

  if (quantity < 0) {
    const ok = await productModel.decrementStock(productId, Math.abs(quantity));
    if (!ok) {
      res.status(409);
      throw new Error('Insufficient stock for this product');
    }
  } else if (quantity > 0) {
    await productModel.incrementStock(productId, quantity);
  }

  const product = await productModel.findById(productId);
  res.json({ success: true, data: product });
});

module.exports = {
  listProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  adjustStock,
};
