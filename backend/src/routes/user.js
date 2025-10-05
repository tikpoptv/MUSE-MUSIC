const express = require('express');
const router = express.Router();
const { getUserData } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/me', authenticateToken, getUserData);

module.exports = router;
