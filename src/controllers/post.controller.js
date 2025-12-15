// File: src/controllers/post.controller.js

const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} = require('../services/post.service');
const { createdResponse, okResponse } = require('../utils/apiResponse');

/**
 * Create a new post
 * @route POST /api/posts
 * @access Private
 */
const create = async (req, res, next) => {
  try {
    const { title, content, published } = req.body;
    const authorId = req.user.userId;

    const post = await createPost({ title, content, published }, authorId);

    return createdResponse(res, 'Post created successfully', { post });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all posts with pagination
 * @route GET /api/posts
 * @access Public
 */
const getAll = async (req, res, next) => {
  try {
    const { page, limit, published, authorId } = req.query;

    const result = await getAllPosts({ page, limit, published, authorId });

    return okResponse(res, 'Posts retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single post by ID
 * @route GET /api/posts/:id
 * @access Public
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await getPostById(id);

    return okResponse(res, 'Post retrieved successfully', { post });
  } catch (error) {
    next(error);
  }
};

/**
 * Update post
 * @route PUT /api/posts/:id
 * @access Private
 */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.userId;

    const post = await updatePost(id, updateData, userId);

    return okResponse(res, 'Post updated successfully', { post });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete post
 * @route DELETE /api/posts/:id
 * @access Private
 */
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await deletePost(id, userId);

    return okResponse(res, 'Post deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};
