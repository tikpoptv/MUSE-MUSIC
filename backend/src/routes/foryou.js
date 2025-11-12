const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getForYouContent, getYourMood } = require('../controllers/foryouController');

router.get('/', authenticateToken, getForYouContent);
router.get('/your-mood', authenticateToken, getYourMood);

module.exports = router;

