const jwt = require('jsonwebtoken');

/**
 * Requires a valid "Bearer <token>" Authorization header. Unlike a
 * monolith, this service does NOT re-fetch the user from the database on
 * every request (that would mean every microservice call round-trips to
 * user-service). Instead it trusts the JWT signature: req.user is set
 * directly from the token payload ({ id, email }).
 *
 * This is the standard "stateless auth" pattern for microservices: the
 * token itself is the source of truth for identity within its expiry
 * window. If you need to react to account changes immediately (e.g. a
 * disabled account), that's a good use case for a short JWT_EXPIRES_IN
 * plus a refresh-token flow - out of scope here to keep the services easy
 * to reason about for DevOps practice.
 */
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

module.exports = { protect };
