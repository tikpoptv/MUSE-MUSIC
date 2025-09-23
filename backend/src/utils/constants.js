const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

const API_MESSAGES = {
  SUCCESS: 'Success',
  ERROR: 'Error',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error'
};

const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  ARTIST: 'artist'
};

module.exports = {
  HTTP_STATUS,
  API_MESSAGES,
  ROLES
};
