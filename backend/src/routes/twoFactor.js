const express = require('express');
const router = express.Router();
const {
  setup2FA,
  verifySetupCode,
  generateBackupCodes,
  verify2FA,
  disable2FA,
  get2FAStatus,
  getBackupCodes,
  regenerateBackupCodes
} = require('../controllers/twoFactorController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/setup', authenticateToken, setup2FA);
router.post('/verify-setup', authenticateToken, verifySetupCode);
router.post('/generate-backup-codes', authenticateToken, generateBackupCodes);
router.post('/verify', authenticateToken, verify2FA);
router.post('/disable', authenticateToken, disable2FA);
router.get('/status', authenticateToken, get2FAStatus);
router.get('/backup-codes', authenticateToken, getBackupCodes);
router.post('/regenerate-backup-codes', authenticateToken, regenerateBackupCodes);

module.exports = router;
