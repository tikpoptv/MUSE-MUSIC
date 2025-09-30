const express = require('express');
const router = express.Router();

const healthRoutes = require('./health');
const authRoutes = require('./auth');

router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MUSE Music API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth'
    }
  });
});

router.use('/api/health', healthRoutes);
router.use('/api/auth', authRoutes);

module.exports = router;
