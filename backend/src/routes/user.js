const express = require('express');
const router = express.Router();
const { getUserData, getUserSettings, updateUserSettings } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/me', authenticateToken, getUserData);
router.get('/settings', authenticateToken, getUserSettings);
router.put('/settings', authenticateToken, updateUserSettings);

module.exports = router;
