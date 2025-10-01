const express = require('express');
const router = express.Router();
const { register, login, googleLogin, googleCallback, refreshToken } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/google
router.post('/google', googleLogin);

// POST /api/auth/google/callback
router.post('/google/callback', googleCallback);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

module.exports = router;
