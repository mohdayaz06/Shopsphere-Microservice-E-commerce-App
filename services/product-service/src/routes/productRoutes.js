const express = require('express');
const {
  listProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
} = require('../controllers/productController');
const { productCreateValidator, productUpdateValidator, searchValidator } = require('../validators/productValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public browsing endpoints - no auth required
router.get('/', listProducts);
router.get('/search', searchValidator, validate, searchProducts);
router.get('/:id', getProductById);

// Write endpoints - require an authenticated user
router.post('/', protect, productCreateValidator, validate, createProduct);
router.put('/:id', protect, productUpdateValidator, validate, updateProduct);
router.delete('/:id', protect, deleteProduct);

// Internal - called by order-service when an order is placed/cancelled
router.patch('/:id/stock', adjustStock);

module.exports = router;
