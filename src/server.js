// File: src/server.js

require('dotenv').config();
const app = require('./app');
const { prisma, disconnectDB } = require('./config/db');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

let server;

/**
 * Start server and verify database connection
 */
const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Start Express server
    server = app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal) => {
  logger.warn(`⚠️  ${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('🔌 HTTP server closed');

      try {
        await disconnectDB();
        logger.info('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

// Handle termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', { promise, reason });
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();
