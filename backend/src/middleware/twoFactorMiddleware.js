const TwoFactorService = require('../services/twoFactorService');
const { errorResponse } = require('../utils/response');
const { logger } = require('./logger');

const require2FA = async (req, res, next) => {
  try {
    const { userID } = req.user;

    const status = await TwoFactorService.get2FAStatus(userID);

    if (!status || !status.twofactorenabled) {
      return next();
    }

    const { token } = req.body;

    if (!token) {
      return res.status(400).json(
        errorResponse('2FA verification code is required', 400)
      );
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const deviceInfo = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';

    const isValid = await TwoFactorService.verifyToken(
      userID,
      token,
      null,
      ipAddress,
      userAgent,
      deviceInfo
    );

    if (!isValid) {
      return res.status(400).json(
        errorResponse('Invalid 2FA verification code', 400)
      );
    }

    next();
  } catch (error) {
    logger.error('2FA middleware error:', error);
    if (error.message.includes('locked')) {
      res.status(423).json(
        errorResponse('Account temporarily locked due to too many failed attempts', 423)
      );
    } else {
      res.status(500).json(
        errorResponse('2FA verification failed', 500)
      );
    }
  }
};

const check2FARequired = async (req, res, next) => {
  try {
    const { userID } = req.user;

    const status = await TwoFactorService.get2FAStatus(userID);

    if (status && status.twofactorenabled) {
      req.requires2FA = true;
    } else {
      req.requires2FA = false;
    }

    next();
  } catch (error) {
    logger.error('Check 2FA required error:', error);
    next();
  }
};

module.exports = {
  require2FA,
  check2FARequired
};
