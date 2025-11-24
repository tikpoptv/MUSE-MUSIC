const express = require('express');
const router = express.Router();
const { searchVideos, getVideoDetails, getTranscript, startYoutubeAnalysis } = require('../controllers/youtubeController');
const youtubeTranscriptRateLimit = require('../middleware/youtubeTranscriptRateLimit');

router.get('/search', searchVideos);
router.get('/video/:videoId', getVideoDetails);
router.get('/transcript/:videoId', youtubeTranscriptRateLimit, getTranscript);
router.post('/analyze', startYoutubeAnalysis);

module.exports = router;

