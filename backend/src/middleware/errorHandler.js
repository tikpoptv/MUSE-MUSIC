const { logger } = require('./logger');

const errorHandler = (err, req, res, next) => {
  // Skip if response already sent
  if (res.headersSent) {
    return next(err);
  }

  let error = { ...err };
  error.message = err.message;

  logger.error('Error occurred:', err);

  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  const statusCode = error.statusCode || 500;
  
  // Check if res.status is a function before using it
  if (typeof res.status === 'function') {
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  } else {
    // Fallback: try to send response directly
    try {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }));
    } catch (e) {
      // If all else fails, just log the error
      // eslint-disable-next-line no-console
      console.error('Failed to send error response:', e);
    }
  }
};

module.exports = errorHandler;

