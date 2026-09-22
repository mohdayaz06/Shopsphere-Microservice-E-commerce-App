const express = require('express');
const {
  createPayment,
  getPaymentById,
  getPaymentsByOrder,
  listMyPayments,
  refundPayment,
} = require('../controllers/paymentController');
const { createPaymentValidator, paymentIdValidator, orderIdValidator } = require('../validators/paymentValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', listMyPayments);
router.post('/', createPaymentValidator, validate, createPayment);
router.get('/order/:orderId', orderIdValidator, validate, getPaymentsByOrder);
router.get('/:id', paymentIdValidator, validate, getPaymentById);
router.post('/:id/refund', paymentIdValidator, validate, refundPayment);

module.exports = router;
