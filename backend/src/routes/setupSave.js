const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { saveSetupStep, skipSetup, completeSetup } = require('../controllers/setupSaveController');

router.post('/save', authenticateToken, saveSetupStep);
router.post('/skip', authenticateToken, skipSetup);
router.post('/complete', authenticateToken, completeSetup);

module.exports = router;
