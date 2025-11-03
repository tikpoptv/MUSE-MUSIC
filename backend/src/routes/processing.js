const express = require('express');
const router = express.Router();
const { updateYouTubeVideoId } = require('../controllers/processingController');

// Update YouTube video ID for processing (optional auth)
router.put('/:processingID/youtube-video-id', updateYouTubeVideoId);

module.exports = router;

