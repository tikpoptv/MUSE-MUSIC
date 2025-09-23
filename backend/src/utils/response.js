const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message = 'Error', statusCode = 500, error = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(error && { error })
  });
};

const sendValidationError = (res, errors) => {
  res.status(400).json({
    success: false,
    message: 'Validation Error',
    errors
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError
};
