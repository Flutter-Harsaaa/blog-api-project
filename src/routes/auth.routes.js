// File: src/routes/auth.routes.js

const express = require('express');
const { register, login, getProfile } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateRegistration, validateLogin } = require('../middlewares/validate.middleware');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegistration, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', validateLogin, login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

module.exports = router;
