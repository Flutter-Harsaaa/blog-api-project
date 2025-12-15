// File: src/middlewares/error.middleware.js

const logger = require('../config/logger');

/**
 * Centralized error handling middleware
 * Catches all errors passed via next(err) and returns consistent JSON responses
 */
const errorHandler = (err, req, res, next) => {
  // Default error properties
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = 'A record with this unique field already exists';
        errors = { field: err.meta?.target };
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Foreign key constraint failed';
        break;
      default:
        statusCode = 400;
        message = 'Database operation failed';
    }
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // Log errors with Winston
  logger.error('Error occurred:', {
    message: err.message,
    statusCode,
    code: err.code,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Handle 404 - Route not found
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
};
