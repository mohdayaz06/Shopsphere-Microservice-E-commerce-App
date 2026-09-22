const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const generateToken = require('../utils/generateToken');

const SALT_ROUNDS = 10;

const register = async ({ fullName, email, phone, password }) => {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.create({ fullName, email, phone, passwordHash });
  const token = generateToken(user);
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }
  if (user.status === 'disabled') {
    const err = new Error('This account has been disabled. Please contact support.');
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user);
  return { user, token };
};

module.exports = { register, login };
