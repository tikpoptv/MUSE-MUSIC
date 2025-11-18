const { URL } = require('url');
const { config } = require('../config/env');
const { sendError } = require('../utils/response');

function getHostFromHeader(value) {
  try {
    if (!value) return null;
    const u = new URL(value);
    return u.host;
  } catch {
    return null;
  }
}

module.exports = function enforceFrontendOrigin(req, res, next) {
  if (config.server.isDevelopment) {
    return next();
  }

  // Skip static assets (favicon, images, etc.)
  const staticAssetPatterns = [
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '.ico',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.css',
    '.js',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot'
  ];

  const isStaticAsset = staticAssetPatterns.some(pattern => 
    req.path.toLowerCase().includes(pattern.toLowerCase())
  );

  if (isStaticAsset) {
    return next();
  }

  const allowedHost = getHostFromHeader(config.frontend.url);
  const originHost = getHostFromHeader(req.headers.origin);
  const refererHost = getHostFromHeader(req.headers.referer);

  if (originHost === allowedHost || refererHost === allowedHost) {
    return next();
  }

  return sendError(res, 'Forbidden: requests must originate from approved frontend', 403);
};
