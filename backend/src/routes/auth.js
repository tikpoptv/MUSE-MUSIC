const express = require('express');
const router = express.Router();
const { register, login, googleLogin, googleCallback, refreshToken, forgotPassword, resetPassword, validateResetToken } = require('../controllers/authController');
const { logout } = require('../controllers/logoutController');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/google/callback', googleCallback);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/validate-reset-token/:token', validateResetToken);

module.exports = router;
