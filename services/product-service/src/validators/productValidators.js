const { body, query } = require('express-validator');

const productCreateValidator = [
  body('categoryId').isInt({ min: 1 }).withMessage('A valid categoryId is required'),
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 150 }),
  body('description').optional({ checkFalsy: true }).isLength({ max: 5000 }),
  body('brand').optional({ checkFalsy: true }).isLength({ max: 80 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('discountPercent').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
  body('imageUrl').trim().notEmpty().withMessage('Image URL is required').isLength({ max: 500 }),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
];

const productUpdateValidator = [
  body('categoryId').optional().isInt({ min: 1 }),
  body('name').optional().trim().isLength({ min: 1, max: 150 }),
  body('price').optional().isFloat({ min: 0 }),
  body('discountPercent').optional().isFloat({ min: 0, max: 100 }),
  body('stockQuantity').optional().isInt({ min: 0 }),
];

const searchValidator = [query('q').optional().trim().isLength({ max: 100 })];

module.exports = { productCreateValidator, productUpdateValidator, searchValidator };
