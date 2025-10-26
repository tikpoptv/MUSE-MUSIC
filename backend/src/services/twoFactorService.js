const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const DatabaseService = require('./databaseService');
const { logger } = require('../middleware/logger');

class TwoFactorService {
  static async generateSecret(userID, username) {
    try {
      const secret = speakeasy.generateSecret({
        name: `MUSE Music (${username})`,
        issuer: 'MUSE Music',
        length: 32
      });

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      await DatabaseService.query(
        `INSERT INTO UserTwoFactorAuth (userID, secretKey, setupStep) 
         VALUES ($1, $2, 'qr_generated')
         ON CONFLICT (userID) 
         DO UPDATE SET secretKey = $2, setupStep = 'qr_generated', updatedAt = CURRENT_TIMESTAMP`,
        [userID, secret.base32]
      );

      return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      };
    } catch (error) {
      logger.error('Generate secret error:', error);
      throw error;
    }
  }

  static async verifySetupCode(userID, token) {
    try {
      const result = await DatabaseService.query(
        'SELECT secretKey FROM UserTwoFactorAuth WHERE userID = $1',
        [userID]
      );

      if (result.rows.length === 0) {
        throw new Error('2FA setup not found');
      }

      const secret = result.rows[0].secretkey;
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (verified) {
        await DatabaseService.query(
          `UPDATE UserTwoFactorAuth 
           SET setupStep = 'verified', updatedAt = CURRENT_TIMESTAMP 
           WHERE userID = $1`,
          [userID]
        );
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Verify setup code error:', error);
      throw error;
    }
  }

  static async generateBackupCodes(userID) {
    try {
      const backupCodes = [];
      for (let i = 0; i < 10; i++) {
        backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
      }

      await DatabaseService.query(
        `UPDATE UserTwoFactorAuth 
         SET backupCodes = $1, setupStep = 'backup_codes_generated', 
             setupCompleted = true, updatedAt = CURRENT_TIMESTAMP 
         WHERE userID = $1`,
        [backupCodes]
      );

      await DatabaseService.query(
        `UPDATE Users 
         SET twoFactorEnabled = true, twoFactorSetupCompleted = true, updatedAt = CURRENT_TIMESTAMP 
         WHERE userID = $1`,
        [userID]
      );

      return backupCodes;
    } catch (error) {
      logger.error('Generate backup codes error:', error);
      throw error;
    }
  }

  static async verifyToken(userID, token, sessionID, ipAddress, userAgent, deviceInfo) {
    try {
      const result = await DatabaseService.query(
        `SELECT secretKey, backupCodes, failedAttempts, isLocked, lockedUntil 
         FROM UserTwoFactorAuth WHERE userID = $1`,
        [userID]
      );

      if (result.rows.length === 0) {
        throw new Error('2FA not enabled for user');
      }

      const { secretkey, backupcodes, failedattempts, islocked, lockeduntil } = result.rows[0];

      if (islocked && lockeduntil && new Date() < new Date(lockeduntil)) {
        throw new Error('Account is temporarily locked due to too many failed attempts');
      }

      let isValid = false;
      let verificationType = 'totp';

      const totpVerified = speakeasy.totp.verify({
        secret: secretkey,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (totpVerified) {
        isValid = true;
      } else if (backupcodes && backupcodes.includes(token)) {
        isValid = true;
        verificationType = 'backup_code';
        
        const updatedBackupCodes = backupcodes.filter(code => code !== token);
        await DatabaseService.query(
          'UPDATE UserTwoFactorAuth SET backupCodes = $1 WHERE userID = $2',
          [updatedBackupCodes, userID]
        );
      }

      await DatabaseService.query(
        `INSERT INTO TwoFactorVerification 
         (userID, sessionID, verificationType, verificationCode, isSuccessful, 
          ipAddress, userAgent, deviceInfo) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userID, sessionID, verificationType, token, isValid, ipAddress, userAgent, deviceInfo]
      );

      if (isValid) {
        await DatabaseService.query(
          `UPDATE UserTwoFactorAuth 
           SET failedAttempts = 0, isLocked = false, lockedUntil = NULL, 
               lastUsedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP 
           WHERE userID = $1`,
          [userID]
        );
      } else {
        const newFailedAttempts = failedattempts + 1;
        const shouldLock = newFailedAttempts >= 5;
        const lockUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

        await DatabaseService.query(
          `UPDATE UserTwoFactorAuth 
           SET failedAttempts = $1, isLocked = $2, lockedUntil = $3, updatedAt = CURRENT_TIMESTAMP 
           WHERE userID = $4`,
          [newFailedAttempts, shouldLock, lockUntil, userID]
        );
      }

      return isValid;
    } catch (error) {
      logger.error('Verify token error:', error);
      throw error;
    }
  }

  static async disable2FA(userID) {
    try {
      await DatabaseService.query('DELETE FROM UserTwoFactorAuth WHERE userID = $1', [userID]);
      
      await DatabaseService.query(
        `UPDATE Users 
         SET twoFactorEnabled = false, twoFactorSetupCompleted = false, updatedAt = CURRENT_TIMESTAMP 
         WHERE userID = $1`,
        [userID]
      );

      return true;
    } catch (error) {
      logger.error('Disable 2FA error:', error);
      throw error;
    }
  }

  static async get2FAStatus(userID) {
    try {
      const result = await DatabaseService.query(
        `SELECT u.twoFactorEnabled, u.twoFactorSetupCompleted, 
                tfa.setupStep, tfa.failedAttempts, tfa.isLocked, tfa.lockedUntil,
                array_length(tfa.backupCodes, 1) as backupCodesCount
         FROM Users u
         LEFT JOIN UserTwoFactorAuth tfa ON u.userID = tfa.userID
         WHERE u.userID = $1`,
        [userID]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Get 2FA status error:', error);
      throw error;
    }
  }

  static async getBackupCodes(userID) {
    try {
      const result = await DatabaseService.query(
        'SELECT backupCodes FROM UserTwoFactorAuth WHERE userID = $1',
        [userID]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0].backupcodes;
    } catch (error) {
      logger.error('Get backup codes error:', error);
      throw error;
    }
  }

  static async regenerateBackupCodes(userID) {
    try {
      const backupCodes = [];
      for (let i = 0; i < 10; i++) {
        backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
      }

      await DatabaseService.query(
        'UPDATE UserTwoFactorAuth SET backupCodes = $1, updatedAt = CURRENT_TIMESTAMP WHERE userID = $2',
        [backupCodes, userID]
      );

      return backupCodes;
    } catch (error) {
      logger.error('Regenerate backup codes error:', error);
      throw error;
    }
  }
}

module.exports = TwoFactorService;
