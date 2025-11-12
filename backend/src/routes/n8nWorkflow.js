const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { getWorkflowInfo, executeWorkflow } = require('../controllers/n8nWorkflowController');

router.get('/', authenticateToken, requireRole(['admin', 'super_admin']), getWorkflowInfo);
router.post('/', authenticateToken, requireRole(['admin', 'super_admin']), executeWorkflow);

module.exports = router;

