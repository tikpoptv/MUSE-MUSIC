const express = require('express');
const router = express.Router();
const { submitRating, getRatingStats, getUserRating } = require('../controllers/ratingController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Submit rating (requires authentication)
router.post('/:processingID', authenticateToken, submitRating);

// Get rating statistics (public, no auth required)
router.get('/:processingID/stats', getRatingStats);

// Get user's rating (requires authentication)
router.get('/:processingID/user', authenticateToken, getUserRating);

module.exports = router;

