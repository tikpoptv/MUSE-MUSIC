// NOTE:
// Rate limiter for upcoming analysis endpoints (e.g. /api/analysis/*).
// Not used for lyrics endpoints. For multi-instance, use a shared store (e.g., Redis).
const JWTService = require('../services/jwtService');
const { sendError } = require('../utils/response');

// In-memory store (single instance only)
const limitStore = new Map(); // key -> { count, resetAt }
const MAX_GUEST_REQUESTS_PER_DAY = 2;

function getClientKey(req) {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || '';
  return `${ip}|${ua}`;
}

module.exports = function analysisRateLimit(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = JWTService.extractTokenFromHeader(authHeader);
    const decoded = token ? JWTService.verifyAccessToken(token) : null;

    // Authenticated users: no limit
    if (decoded) {
      return next();
    }

    // Guests: limit 2 requests per day per IP+UA
    const key = getClientKey(req);
    const now = Date.now();
    let entry = limitStore.get(key);
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + oneDayMs };
    }

    if (entry.count >= MAX_GUEST_REQUESTS_PER_DAY) {
      const retryAfterSec = Math.max(1, Math.floor((entry.resetAt - now) / 1000));
      res.setHeader('Retry-After', `${retryAfterSec}`);
      res.setHeader('X-RateLimit-Limit', `${MAX_GUEST_REQUESTS_PER_DAY}`);
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', `${Math.floor(entry.resetAt / 1000)}`);
      return sendError(res, 'Rate limit exceeded for guest. Please authenticate to continue.', 429);
    }

    entry.count += 1;
    limitStore.set(key, entry);

    res.setHeader('X-RateLimit-Limit', `${MAX_GUEST_REQUESTS_PER_DAY}`);
    res.setHeader('X-RateLimit-Remaining', `${Math.max(0, MAX_GUEST_REQUESTS_PER_DAY - entry.count)}`);
    res.setHeader('X-RateLimit-Reset', `${Math.floor(entry.resetAt / 1000)}`);

    return next();
  } catch (err) {
    return sendError(res, 'Rate limit check failed', 500);
  }
};


