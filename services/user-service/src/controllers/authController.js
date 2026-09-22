const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');
const userModel = require('../models/userModel');

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({
    success: true,
    data: { user: { id: user.id, fullName: user.full_name, email: user.email, phone: user.phone }, token },
  });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.json({
    success: true,
    data: { user: { id: user.id, fullName: user.full_name, email: user.email, phone: user.phone }, token },
  });
});

/**
 * Stateless JWT logout: there's no server-side session to destroy. The
 * client is responsible for discarding the token. This endpoint exists
 * for a consistent API surface (and is the natural place to add token
 * blacklisting later, e.g. via Redis, if that becomes necessary).
 */
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const updated = await userModel.updateProfile(req.user.id, req.body);
  res.json({ success: true, data: updated });
});

module.exports = { register, login, logout, getProfile, updateProfile };
