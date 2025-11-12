const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { getAnalysisData } = require('../controllers/adminAnalysisController');

router.get('/', authenticateToken, requireRole(['admin', 'super_admin']), getAnalysisData);

module.exports = router;

