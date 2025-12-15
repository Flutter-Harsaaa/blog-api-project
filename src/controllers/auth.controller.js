// File: src/controllers/auth.controller.js

const { registerUser, loginUser, getUserById } = require('../services/auth.service');
const { generateToken } = require('../config/jwt');
const { createdResponse, okResponse } = require('../utils/apiResponse');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Register user via service
    const user = await registerUser({ name, email, password });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return createdResponse(res, 'User registered successfully', {
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Authenticate user via service
    const user = await loginUser({ email, password });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return okResponse(res, 'Login successful', {
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 * @access Private
 */
const getProfile = async (req, res, next) => {
  try {
    // User ID attached by auth middleware
    const userId = req.user.userId;

    // Get user data via service
    const user = await getUserById(userId);

    return okResponse(res, 'Profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
