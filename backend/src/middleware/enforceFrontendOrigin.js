const { URL } = require('url');
const { config } = require('../config/env');
const { sendError } = require('../utils/response');

function getHostFromHeader(value) {
  try {
    if (!value) return null;
    const u = new URL(value);
    return u.host; // includes host:port
  } catch {
    return null;
  }
}

module.exports = function enforceFrontendOrigin(req, res, next) {
  const allowedHost = getHostFromHeader(config.frontend.url);
  const originHost = getHostFromHeader(req.headers.origin);
  const refererHost = getHostFromHeader(req.headers.referer);

  // Allow when either Origin or Referer matches our frontend host
  if (originHost === allowedHost || refererHost === allowedHost) {
    return next();
  }

  // Explicitly block non-browser/unknown clients (e.g., Postman that lacks Origin/Referer)
  return sendError(res, 'Forbidden: requests must originate from approved frontend', 403);
};


