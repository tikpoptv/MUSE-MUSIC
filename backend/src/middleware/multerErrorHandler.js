const { errorResponse } = require('../utils/response');
const { logger } = require('./logger');

/**
 * Error handling middleware for multer errors
 * Should be placed after multer middleware
 */
const multerErrorHandler = (err, req, res, next) => {
  if (err) {
    logger.error('Multer error:', err);

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(
        errorResponse('File size exceeds the maximum limit of 5MB', 400)
      );
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json(
        errorResponse('Too many files', 400)
      );
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json(
        errorResponse('Unexpected file field', 400)
      );
    }

    // Custom multer fileFilter errors
    if (err.message && err.message.includes('Only image files')) {
      return res.status(400).json(
        errorResponse(err.message, 400)
      );
    }

    // Generic multer error
    return res.status(400).json(
      errorResponse(err.message || 'File upload error', 400)
    );
  }

  next();
};

module.exports = multerErrorHandler;

