const TwoFactorService = require('../services/twoFactorService');
const DatabaseService = require('../services/databaseService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');

const setup2FA = async (req, res) => {
  try {
    const { userID } = req.user;
    
    // Get username and email from database
    const userResult = await DatabaseService.query(
      'SELECT username, email FROM Users WHERE userID = $1',
      [userID]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json(
        errorResponse('User not found', 404)
      );
    }
    
    const { username, email } = userResult.rows[0];

    const result = await TwoFactorService.generateSecret(userID, username, email);

    res.status(200).json(
      successResponse('2FA setup initiated', {
        qrCode: result.qrCode,
        manualEntryKey: result.manualEntryKey
      })
    );
  } catch (error) {
    logger.error('Setup 2FA error:', error);
    res.status(500).json(
      errorResponse('Failed to setup 2FA', 500)
    );
  }
};

const verifySetupCode = async (req, res) => {
  try {
    const { userID } = req.user;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json(
        errorResponse('Verification code is required', 400)
      );
    }

    const isValid = await TwoFactorService.verifySetupCode(userID, token);

    if (!isValid) {
      return res.status(400).json(
        errorResponse('Invalid verification code', 400)
      );
    }

    res.status(200).json(
      successResponse('Verification code is valid', { verified: true })
    );
  } catch (error) {
    logger.error('Verify setup code error:', error);
    res.status(500).json(
      errorResponse('Failed to verify code', 500)
    );
  }
};

const generateBackupCodes = async (req, res) => {
  try {
    const { userID } = req.user;

    const backupCodes = await TwoFactorService.generateBackupCodes(userID);

    res.status(200).json(
      successResponse('Backup codes generated', { backupCodes })
    );
  } catch (error) {
    logger.error('Generate backup codes error:', error);
    res.status(500).json(
      errorResponse('Failed to generate backup codes', 500)
    );
  }
};

const verify2FA = async (req, res) => {
  try {
    const { userID } = req.user;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json(
        errorResponse('Verification code is required', 400)
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
        errorResponse('Invalid verification code', 400)
      );
    }

    res.status(200).json(
      successResponse('2FA verification successful', { verified: true })
    );
  } catch (error) {
    logger.error('Verify 2FA error:', error);
    if (error.message.includes('locked')) {
      res.status(423).json(
        errorResponse('Account temporarily locked due to too many failed attempts', 423)
      );
    } else {
      res.status(500).json(
        errorResponse('Failed to verify 2FA', 500)
      );
    }
  }
};

const disable2FA = async (req, res) => {
  try {
    const { userID } = req.user;

    await TwoFactorService.disable2FA(userID);

    res.status(200).json(
      successResponse('2FA disabled successfully', { disabled: true })
    );
  } catch (error) {
    logger.error('Disable 2FA error:', error);
    res.status(500).json(
      errorResponse('Failed to disable 2FA', 500)
    );
  }
};

const get2FAStatus = async (req, res) => {
  try {
    const { userID } = req.user;

    const status = await TwoFactorService.get2FAStatus(userID);

    if (!status) {
      return res.status(404).json(
        errorResponse('2FA status not found', 404)
      );
    }

    res.status(200).json(
      successResponse('2FA status retrieved', status)
    );
  } catch (error) {
    logger.error('Get 2FA status error:', error);
    res.status(500).json(
      errorResponse('Failed to get 2FA status', 500)
    );
  }
};

const getBackupCodes = async (req, res) => {
  try {
    const { userID } = req.user;

    const backupCodes = await TwoFactorService.getBackupCodes(userID);

    if (!backupCodes) {
      return res.status(404).json(
        errorResponse('Backup codes not found', 404)
      );
    }

    res.status(200).json(
      successResponse('Backup codes retrieved', { backupCodes })
    );
  } catch (error) {
    logger.error('Get backup codes error:', error);
    res.status(500).json(
      errorResponse('Failed to get backup codes', 500)
    );
  }
};

const regenerateBackupCodes = async (req, res) => {
  try {
    const { userID } = req.user;

    const backupCodes = await TwoFactorService.regenerateBackupCodes(userID);

    res.status(200).json(
      successResponse('Backup codes regenerated', { backupCodes })
    );
  } catch (error) {
    logger.error('Regenerate backup codes error:', error);
    res.status(500).json(
      errorResponse('Failed to regenerate backup codes', 500)
    );
  }
};

module.exports = {
  setup2FA,
  verifySetupCode,
  generateBackupCodes,
  verify2FA,
  disable2FA,
  get2FAStatus,
  getBackupCodes,
  regenerateBackupCodes
};
