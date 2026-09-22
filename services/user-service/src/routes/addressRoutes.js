const express = require('express');
const { listAddresses, createAddress, deleteAddress } = require('../controllers/addressController');
const { addressValidator } = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(listAddresses).post(addressValidator, validate, createAddress);
router.delete('/:id', deleteAddress);

module.exports = router;
