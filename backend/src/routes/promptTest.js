const express = require('express');
const router = express.Router();
const { testPrompt } = require('../controllers/promptTestController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Set timeout to 5 minutes (300,000 ms) for prompt test endpoint
const TIMEOUT_5_MINUTES = 5 * 60 * 1000;

// Middleware to set timeout for this specific route
const setRequestTimeout = (req, res, next) => {
  req.setTimeout(TIMEOUT_5_MINUTES, () => {
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        error: 'Request timeout - the request took too long to complete'
      });
    }
  });
  next();
};

router.post('/test', setRequestTimeout, authenticateToken, requireRole(['admin', 'super_admin']), testPrompt);

module.exports = router;

