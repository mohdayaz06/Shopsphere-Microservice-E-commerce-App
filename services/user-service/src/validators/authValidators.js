const { body } = require('express-validator');

const registerValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 120 }),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).isLength({ max: 20 }),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
];

const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const profileValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 120 }),
  body('phone').optional({ checkFalsy: true }).isLength({ max: 20 }),
];

const addressValidator = [
  body('label').optional({ checkFalsy: true }).isLength({ max: 50 }),
  body('line1').trim().notEmpty().withMessage('Address line 1 is required').isLength({ max: 150 }),
  body('line2').optional({ checkFalsy: true }).isLength({ max: 150 }),
  body('city').trim().notEmpty().withMessage('City is required').isLength({ max: 80 }),
  body('state').trim().notEmpty().withMessage('State is required').isLength({ max: 80 }),
  body('postalCode').trim().notEmpty().withMessage('Postal code is required').isLength({ max: 20 }),
  body('country').optional({ checkFalsy: true }).isLength({ max: 60 }),
  body('isDefault').optional().isBoolean(),
];

module.exports = { registerValidator, loginValidator, profileValidator, addressValidator };
