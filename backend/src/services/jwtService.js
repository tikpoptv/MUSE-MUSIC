const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

class JWTService {
  static generateAccessToken(userID, username, role) {
    const payload = {
      userID,
      username,
      role,
      type: 'access'
    };

    const options = {
      expiresIn: config.jwt.accessExpiresIn,
      issuer: 'muse-music-api',
      audience: 'muse-music-client'
    };

    return jwt.sign(payload, config.jwt.secret, options);
  }

  static generateRefreshToken(userID) {
    const payload = {
      userID,
      type: 'refresh'
    };

    const options = {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'muse-music-api',
      audience: 'muse-music-client'
    };

    return jwt.sign(payload, config.jwt.secret, options);
  }

  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      return null;
    }
  }

  static verifyAccessToken(token) {
    const decoded = this.verifyToken(token);
    if (decoded && decoded.type === 'access') {
      return decoded;
    }
    return null;
  }

  static verifyRefreshToken(token) {
    const decoded = this.verifyToken(token);
    if (decoded && decoded.type === 'refresh') {
      return decoded;
    }
    return null;
  }

  static extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}

module.exports = JWTService;
