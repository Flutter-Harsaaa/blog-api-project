// File: src/config/db.js

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error'] 
      : ['error'],
    errorFormat: 'minimal',
  });
};

const globalForPrisma = global;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown handler
 */
const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    
    // Disconnect Redis if available
    const { disconnectRedis } = require('./redis');
    await disconnectRedis();
    
    logger.info('✅ Database and Redis disconnected successfully');
  } catch (error) {
    logger.error('❌ Error disconnecting from database:', error);
    process.exit(1);
  }
};

process.on('SIGINT', disconnectDB);
process.on('SIGTERM', disconnectDB);

module.exports = { prisma, disconnectDB };
