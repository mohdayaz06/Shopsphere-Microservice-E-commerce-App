const { body, param } = require('express-validator');

const createPaymentValidator = [
  body('orderId').isInt({ min: 1 }).withMessage('A valid orderId is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('method').isIn(['CARD', 'UPI', 'NET_BANKING', 'COD']).withMessage('Invalid payment method'),
];

const paymentIdValidator = [param('id').isInt({ min: 1 }).withMessage('Invalid payment id')];
const orderIdValidator = [param('orderId').isInt({ min: 1 }).withMessage('Invalid order id')];

module.exports = { createPaymentValidator, paymentIdValidator, orderIdValidator };
