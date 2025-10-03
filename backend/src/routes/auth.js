const express = require('express');
const router = express.Router();
const { register, login, googleLogin, googleCallback, refreshToken } = require('../controllers/authController');
const { logout } = require('../controllers/logoutController');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/google/callback', googleCallback);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;
