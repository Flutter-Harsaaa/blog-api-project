// File: src/utils/apiResponse.js

/**
 * Standard success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data (optional)
 */
const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standard error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} errors - Validation or field errors (optional)
 */
const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Created response (201)
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Created resource data
 */
const createdResponse = (res, message, data) => {
  return successResponse(res, 201, message, data);
};

/**
 * OK response (200)
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Response data (optional)
 */
const okResponse = (res, message, data = null) => {
  return successResponse(res, 200, message, data);
};

/**
 * Bad request response (400)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {*} errors - Validation errors (optional)
 */
const badRequestResponse = (res, message, errors = null) => {
  return errorResponse(res, 400, message, errors);
};

/**
 * Unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, 401, message);
};

/**
 * Forbidden response (403)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, 403, message);
};

/**
 * Not found response (404)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, 404, message);
};

/**
 * Conflict response (409)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {*} errors - Conflict details (optional)
 */
const conflictResponse = (res, message, errors = null) => {
  return errorResponse(res, 409, message, errors);
};

/**
 * Internal server error response (500)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const internalErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(res, 500, message);
};

module.exports = {
  successResponse,
  errorResponse,
  createdResponse,
  okResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  internalErrorResponse,
};
