// File: src/routes/comment.routes.js

const express = require('express');
const {
  create,
  getByPostId,
  getById,
  update,
  remove,
} = require('../controllers/comment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  validateCommentCreation,
  validateCommentUpdate,
} = require('../middlewares/validate.middleware');

const router = express.Router();

/**
 * @route   POST /api/comments/:postId
 * @desc    Create a new comment on a post
 * @access  Private
 */
router.post('/:postId', authenticate, validateCommentCreation, create);

/**
 * @route   GET /api/comments/post/:postId
 * @desc    Get all comments for a specific post
 * @access  Public
 */
router.get('/post/:postId', getByPostId);

/**
 * @route   GET /api/comments/:id
 * @desc    Get single comment by ID
 * @access  Public
 */
router.get('/:id', getById);

/**
 * @route   PUT /api/comments/:id
 * @desc    Update a comment
 * @access  Private (Owner only)
 */
router.put('/:id', authenticate, validateCommentUpdate, update);

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment
 * @access  Private (Owner only)
 */
router.delete('/:id', authenticate, remove);

module.exports = router;
