const express = require('express');
const router = express.Router();
const { getLogs, getLogStats } = require('../controllers/adminLogsController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, requireRole(['admin', 'super_admin']), getLogs);
router.get('/stats', authenticateToken, requireRole(['admin', 'super_admin']), getLogStats);

module.exports = router;

