const express = require('express');
const router = express.Router();
const { updateYouTubeVideoId, updateCoverImage, updateSyncSettings } = require('../controllers/processingController');

// Update YouTube video ID for processing (optional auth)
router.put('/:processingID/youtube-video-id', updateYouTubeVideoId);

// Update cover image for processing (optional auth)
router.put('/:processingID/cover-image', updateCoverImage);
router.put('/:processingID/sync-settings', updateSyncSettings);

module.exports = router;

