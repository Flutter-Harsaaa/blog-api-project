// File: src/config/redis.js

const Redis = require('ioredis');
const logger = require('./logger');

/**
 * Create Redis client instance using connection URL
 * Supports both local and cloud Redis instances
 */
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

/**
 * Redis connection event handlers
 */
redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('ready', () => {
  logger.info('🚀 Redis is ready to accept commands');
});

redis.on('error', (error) => {
  logger.error('❌ Redis connection error:', error);
});

redis.on('close', () => {
  logger.warn('⚠️  Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.info('🔄 Redis reconnecting...');
});

/**
 * Graceful shutdown for Redis
 */
const disconnectRedis = async () => {
  try {
    await redis.quit();
    logger.info('✅ Redis disconnected successfully');
  } catch (error) {
    logger.error('❌ Error disconnecting Redis:', error);
  }
};

module.exports = { redis, disconnectRedis };
