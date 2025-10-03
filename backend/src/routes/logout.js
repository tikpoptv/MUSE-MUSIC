const express = require('express');
const { logout } = require('../controllers/logoutController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, logout);

module.exports = router;
