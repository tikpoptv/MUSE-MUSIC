// const { logger } = require('./logger');

// const errorHandler = (err, req, res) => {
//   let error = { ...err };
//   error.message = err.message;

//   logger.error('Error occurred:', err);

//   if (err.name === 'CastError') {
//     const message = 'Resource not found';
//     error = { message, statusCode: 404 };
//   }

//   if (err.code === 11000) {
//     const message = 'Duplicate field value entered';
//     error = { message, statusCode: 400 };
//   }

//   if (err.name === 'ValidationError') {
//     const message = Object.values(err.errors).map(val => val.message);
//     error = { message, statusCode: 400 };
//   }

//   res.status(error.statusCode || 500).json({
//     success: false,
//     error: error.message || 'Server Error',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// };

// module.exports = errorHandler;
// src/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
