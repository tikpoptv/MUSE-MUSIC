const express = require('express');
const router = express.Router();
const { searchVideos, getVideoDetails, getTranscript } = require('../controllers/youtubeController');

router.get('/search', searchVideos);
router.get('/video/:videoId', getVideoDetails);
router.get('/transcript/:videoId', getTranscript);

module.exports = router;

