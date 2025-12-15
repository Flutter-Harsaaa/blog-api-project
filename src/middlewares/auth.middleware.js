// File: src/middlewares/auth.middleware.js

const { verifyToken } = require('../config/jwt');

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user to request
 */
const authenticate = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Check if header follows "Bearer <token>" format
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Bearer <token>',
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyToken(token);

    // Attach user data to request object
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token.',
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token exists, but doesn't block request if missing
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');

      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const decoded = verifyToken(token);
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    // Invalid token, but don't block request
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};
