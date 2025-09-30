const express = require('express');
const router = express.Router();
const { register, login, googleLogin, googleCallback } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/google
router.post('/google', googleLogin);

// POST /api/auth/google/callback
router.post('/google/callback', googleCallback);

module.exports = router;
