const express = require('express');
const { getSetupStatus } = require('../controllers/setupController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/status', authenticateToken, getSetupStatus);

module.exports = router;
