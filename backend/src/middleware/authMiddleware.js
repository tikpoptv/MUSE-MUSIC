const JWTService = require('../services/jwtService');
const UserService = require('../services/userService');
const { errorResponse } = require('../utils/response');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json(
        errorResponse('Access token required', 401)
      );
    }

    const decoded = JWTService.verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json(
        errorResponse('Invalid or expired token', 401)
      );
    }

    const user = await UserService.findByID(decoded.userID);

    if (!user) {
      return res.status(401).json(
        errorResponse('User not found', 401)
      );
    }

    req.user = user;
    req.token = decoded;
    next();

  } catch (error) {
    return res.status(500).json(
      errorResponse('Authentication error', 500)
    );
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        errorResponse('Authentication required', 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        errorResponse('Insufficient permissions', 403)
      );
    }

    next();
  };
};

const requireAccessToken = authenticateToken; // alias for clarity in routes

module.exports = {
  authenticateToken,
  requireRole,
  requireAccessToken
};
