const express = require('express');
const router = express.Router();
const { getUserData, getUserSettings, updateUserSettings, resetPassword, getUserStats, acceptTerms } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/me', authenticateToken, getUserData);
router.get('/settings', authenticateToken, getUserSettings);
router.put('/settings', authenticateToken, updateUserSettings);
router.post('/reset-password', authenticateToken, resetPassword);
router.get('/stats', authenticateToken, getUserStats);
router.post('/accept-terms', authenticateToken, acceptTerms);

module.exports = router;
