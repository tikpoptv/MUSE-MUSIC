const express = require('express');
const router = express.Router();
const { searchVideos, getVideoDetails, getTranscript, startYoutubeAnalysis } = require('../controllers/youtubeController');

router.get('/search', searchVideos);
router.get('/video/:videoId', getVideoDetails);
router.get('/transcript/:videoId', getTranscript);
router.post('/analyze', startYoutubeAnalysis);

module.exports = router;

