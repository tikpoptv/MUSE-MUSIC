const express = require('express');
const router = express.Router();
const { getTranslate } = require('../controllers/translateController.js');
const { startAnalysis, reAnalyzeAnalysis, newAnalysis } = require('../controllers/analysisController.js');
const analysisRateLimit = require('../middleware/analysisRateLimit');

router.use(analysisRateLimit);

router.post('/translate', getTranslate);
router.post('/start', startAnalysis);
router.post('/new', newAnalysis);
router.post('/:processingID/re-analyze', reAnalyzeAnalysis);

module.exports = router;