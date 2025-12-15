// File: src/controllers/comment.controller.js

const {
  createComment,
  getCommentsByPostId,
  getCommentById,
  updateComment,
  deleteComment,
} = require('../services/comment.service');
const { createdResponse, okResponse } = require('../utils/apiResponse');

/**
 * Create a new comment on a post
 * @route POST /api/comments/:postId
 * @access Private
 */
const create = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;
    const authorId = req.user.userId;

    const comment = await createComment({ content }, postId, authorId);

    return createdResponse(res, 'Comment created successfully', { comment });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all comments for a specific post
 * @route GET /api/comments/post/:postId
 * @access Public
 */
const getByPostId = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const comments = await getCommentsByPostId(postId);

    return okResponse(res, 'Comments retrieved successfully', { comments });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single comment by ID
 * @route GET /api/comments/:id
 * @access Public
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await getCommentById(id);

    return okResponse(res, 'Comment retrieved successfully', { comment });
  } catch (error) {
    next(error);
  }
};

/**
 * Update comment
 * @route PUT /api/comments/:id
 * @access Private (Owner only)
 */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.userId;

    const comment = await updateComment(id, updateData, userId);

    return okResponse(res, 'Comment updated successfully', { comment });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete comment
 * @route DELETE /api/comments/:id
 * @access Private (Owner only)
 */
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await deleteComment(id, userId);

    return okResponse(res, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getByPostId,
  getById,
  update,
  remove,
};
