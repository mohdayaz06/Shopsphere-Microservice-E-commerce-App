const express = require('express');
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cartController');
const { addItemValidator, updateItemValidator } = require('../validators/cartValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Every cart route requires an authenticated user - carts are always
// scoped to req.user.id, never to a cart id supplied by the client.
router.use(protect);

router.get('/', getCart);
router.post('/items', addItemValidator, validate, addItem);
router.put('/items/:productId', updateItemValidator, validate, updateItem);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);

module.exports = router;
