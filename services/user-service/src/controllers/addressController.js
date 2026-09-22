const asyncHandler = require('express-async-handler');
const addressModel = require('../models/addressModel');

const listAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressModel.findAllByUserId(req.user.id);
  res.json({ success: true, count: addresses.length, data: addresses });
});

const createAddress = asyncHandler(async (req, res) => {
  const address = await addressModel.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: address });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const deleted = await addressModel.remove(Number(req.params.id), req.user.id);
  if (!deleted) {
    res.status(404);
    throw new Error('Address not found');
  }
  res.json({ success: true, data: {} });
});

module.exports = { listAddresses, createAddress, deleteAddress };
