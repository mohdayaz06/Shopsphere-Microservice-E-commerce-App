const { body, param } = require('express-validator');

const placeOrderValidator = [
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 120 }),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Phone number is required').isLength({ max: 20 }),
  body('shippingAddress.line1').trim().notEmpty().withMessage('Address line 1 is required').isLength({ max: 150 }),
  body('shippingAddress.line2').optional({ checkFalsy: true }).isLength({ max: 150 }),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required').isLength({ max: 80 }),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required').isLength({ max: 80 }),
  body('shippingAddress.postalCode').trim().notEmpty().withMessage('Postal code is required').isLength({ max: 20 }),
  body('shippingAddress.country').optional({ checkFalsy: true }).isLength({ max: 60 }),
  body('paymentMethod').isIn(['CARD', 'UPI', 'NET_BANKING', 'COD']).withMessage('Invalid payment method'),
];

const orderIdValidator = [param('id').isInt({ min: 1 }).withMessage('Invalid order id')];

const statusUpdateValidator = [
  body('status')
    .isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    .withMessage('Invalid order status'),
];

module.exports = { placeOrderValidator, orderIdValidator, statusUpdateValidator };
