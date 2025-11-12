const express = require('express');
const router = express.Router();
const { testPrompt } = require('../controllers/promptTestController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.post('/test', authenticateToken, requireRole(['admin', 'super_admin']), testPrompt);

module.exports = router;

