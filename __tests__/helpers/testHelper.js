// File: __tests__/helpers/testHelper.js

const { prisma } = require('../../src/config/db');

/**
 * Clear all test data from database
 */
const clearDatabase = async () => {
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});
};

/**
 * Create test user and return token
 */
const createTestUserWithToken = async (request, userData = global.testUser) => {
  const response = await request.post('/api/auth/register').send(userData);
  
  return {
    user: response.body.data.user,
    token: response.body.data.token,
  };
};

/**
 * Create test post
 */
const createTestPost = async (request, token, postData) => {
  const response = await request
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send(postData);
  
  // Handle potential error response
  if (!response.body.data || !response.body.data.post) {
    throw new Error(`Failed to create test post: ${JSON.stringify(response.body)}`);
  }
  
  return response.body.data.post;
};

/**
 * Close database connections after all tests
 */
const closeDatabase = async () => {
  await prisma.$disconnect();
};

module.exports = {
  clearDatabase,
  createTestUserWithToken,
  createTestPost,
  closeDatabase,
};
