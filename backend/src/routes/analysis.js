const express = require('express');
const router = express.Router();
const { getTranslate } = require('../controllers/translateController.js');
const { startAnalysis } = require('../controllers/analysisController.js');

// Legacy translate endpoint (kept for backwards compatibility)
router.post('/translate', getTranslate);

// New unified analysis endpoint
router.post('/start', startAnalysis);

module.exports = router;