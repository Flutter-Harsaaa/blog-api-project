// File: src/routes/post.routes.js

const express = require('express');
const {
  create,
  getAll,
  getById,
  update,
  remove,
} = require('../controllers/post.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  validatePostCreation,
  validatePostUpdate,
} = require('../middlewares/validate.middleware');

const router = express.Router();

/**
 * @route   GET /api/posts
 * @desc    Get all posts with pagination and filtering
 * @access  Public
 */
router.get('/', getAll);

/**
 * @route   GET /api/posts/:id
 * @desc    Get single post by ID
 * @access  Public
 */
router.get('/:id', getById);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/', authenticate, validatePostCreation, create);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Private (Owner only)
 */
router.put('/:id', authenticate, validatePostUpdate, update);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private (Owner only)
 */
router.delete('/:id', authenticate, remove);

module.exports = router;
