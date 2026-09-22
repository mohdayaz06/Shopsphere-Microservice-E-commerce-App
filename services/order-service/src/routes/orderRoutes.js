const express = require('express');
const {
  placeOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { placeOrderValidator, orderIdValidator, statusUpdateValidator } = require('../validators/orderValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(listOrders).post(placeOrderValidator, validate, placeOrder);
router.get('/:id', orderIdValidator, validate, getOrderById);
router.put('/:id/status', orderIdValidator, statusUpdateValidator, validate, updateOrderStatus);
router.post('/:id/cancel', orderIdValidator, validate, cancelOrder);

module.exports = router;
