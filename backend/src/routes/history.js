const express = require('express');
const router = express.Router();
const { getUserHistory, saveTranslation } = require('../controllers/historyController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getUserHistory);
router.post('/save', authenticateToken, saveTranslation);

module.exports = router;

