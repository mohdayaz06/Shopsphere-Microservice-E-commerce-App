const { body, param } = require('express-validator');

const addItemValidator = [
  body('productId').isInt({ min: 1 }).withMessage('A valid productId is required'),
  body('quantity').optional().isInt({ min: 1, max: 20 }).withMessage('Quantity must be between 1 and 20'),
];

const updateItemValidator = [
  param('productId').isInt({ min: 1 }).withMessage('Invalid product id'),
  body('quantity').isInt({ min: 0, max: 20 }).withMessage('Quantity must be between 0 and 20'),
];

module.exports = { addItemValidator, updateItemValidator };
