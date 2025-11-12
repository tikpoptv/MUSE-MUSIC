const express = require('express');
const router = express.Router();
const { savePrompt } = require('../controllers/promptController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.post('/save', authenticateToken, requireRole(['admin', 'super_admin']), savePrompt);

module.exports = router;

