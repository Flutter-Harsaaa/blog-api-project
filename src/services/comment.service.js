// File: src/services/comment.service.js

const { prisma } = require('../config/db');

/**
 * Create a new comment on a post
 * @param {Object} commentData - Comment creation data
 * @param {string} commentData.content - Comment content
 * @param {number} postId - Post ID to comment on
 * @param {number} authorId - User ID of the commenter
 * @returns {Promise<Object>} Created comment object
 * @throws {Error} If post not found
 */
const createComment = async ({ content }, postId, authorId) => {
  // Verify post exists
  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId) },
  });

  if (!post) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId: parseInt(postId),
      authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return comment;
};

/**
 * Get all comments for a specific post
 * @param {number} postId - Post ID
 * @returns {Promise<Array>} Array of comments
 * @throws {Error} If post not found
 */
const getCommentsByPostId = async (postId) => {
  // Verify post exists
  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId) },
  });

  if (!post) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  const comments = await prisma.comment.findMany({
    where: { postId: parseInt(postId) },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return comments;
};

/**
 * Get comment by ID
 * @param {number} commentId - Comment ID
 * @returns {Promise<Object>} Comment object
 * @throws {Error} If comment not found
 */
const getCommentById = async (commentId) => {
  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(commentId) },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  return comment;
};

/**
 * Update comment
 * @param {number} commentId - Comment ID
 * @param {Object} updateData - Comment update data
 * @param {number} userId - User ID requesting the update
 * @returns {Promise<Object>} Updated comment object
 * @throws {Error} If comment not found or user is not the owner
 */
const updateComment = async (commentId, updateData, userId) => {
  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(commentId) },
  });

  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  // Check ownership
  if (comment.authorId !== userId) {
    const error = new Error('You are not authorized to update this comment');
    error.statusCode = 403;
    throw error;
  }

  const updatedComment = await prisma.comment.update({
    where: { id: parseInt(commentId) },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return updatedComment;
};

/**
 * Delete comment
 * @param {number} commentId - Comment ID
 * @param {number} userId - User ID requesting the deletion
 * @returns {Promise<Object>} Deleted comment object
 * @throws {Error} If comment not found or user is not the owner
 */
const deleteComment = async (commentId, userId) => {
  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(commentId) },
  });

  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  // Check ownership
  if (comment.authorId !== userId) {
    const error = new Error('You are not authorized to delete this comment');
    error.statusCode = 403;
    throw error;
  }

  const deletedComment = await prisma.comment.delete({
    where: { id: parseInt(commentId) },
  });

  return deletedComment;
};

module.exports = {
  createComment,
  getCommentsByPostId,
  getCommentById,
  updateComment,
  deleteComment,
};
