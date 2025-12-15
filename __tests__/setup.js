// File: __tests__/setup.js

const { closeDatabase } = require('./helpers/testHelper');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';

// Increase timeout for database operations
jest.setTimeout(10000);

// Global test utilities
global.testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Test123',
};

global.testUser2 = {
  name: 'Test User 2',
  email: 'test2@example.com',
  password: 'Test123',
};

// Close database connections after all tests
afterAll(async () => {
  await closeDatabase();
});
