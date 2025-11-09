const express = require('express');
const router = express.Router();
const { getTranslate } = require('../controllers/translateController.js');
const { startAnalysis, reAnalyzeAnalysis } = require('../controllers/analysisController.js');

router.post('/translate', getTranslate);
router.post('/start', startAnalysis);
router.post('/:processingID/re-analyze', reAnalyzeAnalysis);

module.exports = router;