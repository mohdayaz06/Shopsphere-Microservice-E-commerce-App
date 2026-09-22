const jwt = require('jsonwebtoken');

/**
 * Signs a JWT for a given user. Every other ShopSphere service verifies
 * this same token using the identical JWT_SECRET env var - there is no
 * central auth server; each service independently validates the token's
 * signature and reads req.user.id from the payload.
 */
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

module.exports = generateToken;
