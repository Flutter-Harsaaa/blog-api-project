// File: src/config/logger.js

const winston = require('winston');

/**
 * Custom log format for better readability
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Development log format with colors
 */
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

/**
 * Log levels
 * error: 0, warn: 1, info: 2, http: 3, debug: 4
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Determine log level based on environment
 */
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

/**
 * Define transports based on environment
 */
const transports = [];

// Console transport
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: devFormat,
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: logFormat,
    })
  );
}

// File transport for errors (production)
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
    })
  );

  transports.push(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
    })
  );
}

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: level(),
  levels,
  format: logFormat,
  transports,
  exitOnError: false,
});

/**
 * Stream for Morgan HTTP logging
 */
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;
