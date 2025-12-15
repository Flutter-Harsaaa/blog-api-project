// File: src/services/post.service.js

const { prisma } = require('../config/db');
const { redis } = require('../config/redis');

const CACHE_TTL = 60; // 60 seconds

/**
 * Generate cache key for posts list
 */
const getPostsListCacheKey = (params) => {
  const { page = 1, limit = 10, published, authorId } = params;
  return `posts:list:page:${page}:limit:${limit}:published:${published}:author:${authorId}`;
};

/**
 * Generate cache key for single post
 */
const getPostCacheKey = (postId) => {
  return `post:${postId}`;
};

/**
 * Invalidate all posts list cache
 */
const invalidatePostsListCache = async () => {
  const keys = await redis.keys('posts:list:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

/**
 * Create a new post
 * @param {Object} postData - Post creation data
 * @param {string} postData.title - Post title
 * @param {string} postData.content - Post content
 * @param {boolean} postData.published - Published status
 * @param {number} authorId - User ID of the author
 * @returns {Promise<Object>} Created post object
 */
const createPost = async ({ title, content, published = false }, authorId) => {
  const post = await prisma.post.create({
    data: {
      title,
      content,
      published,
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
    },
  });

  // Invalidate list cache after creation
  await invalidatePostsListCache();

  return post;
};

/**
 * Get all posts with pagination and filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {boolean} options.published - Filter by published status
 * @param {number} options.authorId - Filter by author ID
 * @returns {Promise<Object>} Posts with pagination metadata
 */
const getAllPosts = async ({ page = 1, limit = 10, published, authorId } = {}) => {
  // Generate cache key
  const cacheKey = getPostsListCacheKey({ page, limit, published, authorId });

  // Try to get from cache
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    // Cache miss or error, continue to database
  }

  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  const where = {};

  if (published !== undefined) {
    where.published = published === 'true' || published === true;
  }

  if (authorId) {
    where.authorId = parseInt(authorId);
  }

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  const result = {
    posts,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / take),
      totalItems: totalCount,
      itemsPerPage: take,
    },
  };

  // Cache the result
  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
  } catch (error) {
    // Cache write failed, but return data anyway
  }

  return result;
};

/**
 * Get post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} Post object with author and comments
 * @throws {Error} If post not found
 */
const getPostById = async (postId) => {
  // Generate cache key
  const cacheKey = getPostCacheKey(postId);

  // Try to get from cache
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    // Cache miss or error, continue to database
  }

  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId) },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      comments: {
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
      },
    },
  });

  if (!post) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  // Cache the result
  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(post));
  } catch (error) {
    // Cache write failed, but return data anyway
  }

  return post;
};

/**
 * Update post
 * @param {number} postId - Post ID
 * @param {Object} updateData - Post update data
 * @param {number} userId - User ID requesting the update
 * @returns {Promise<Object>} Updated post object
 * @throws {Error} If post not found or user is not the owner
 */
const updatePost = async (postId, updateData, userId) => {
  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId) },
  });

  if (!post) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  // Check ownership
  if (post.authorId !== userId) {
    const error = new Error('You are not authorized to update this post');
    error.statusCode = 403;
    throw error;
  }

  const updatedPost = await prisma.post.update({
    where: { id: parseInt(postId) },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Invalidate caches
  await Promise.all([
    redis.del(getPostCacheKey(postId)),
    invalidatePostsListCache(),
  ]);

  return updatedPost;
};

/**
 * Delete post
 * @param {number} postId - Post ID
 * @param {number} userId - User ID requesting the deletion
 * @returns {Promise<Object>} Deleted post object
 * @throws {Error} If post not found or user is not the owner
 */
const deletePost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId) },
  });

  if (!post) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  // Check ownership
  if (post.authorId !== userId) {
    const error = new Error('You are not authorized to delete this post');
    error.statusCode = 403;
    throw error;
  }

  const deletedPost = await prisma.post.delete({
    where: { id: parseInt(postId) },
  });

  // Invalidate caches
  await Promise.all([
    redis.del(getPostCacheKey(postId)),
    invalidatePostsListCache(),
  ]);

  return deletedPost;
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};
