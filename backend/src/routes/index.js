const express = require('express');
const router = express.Router();

const healthRoutes = require('./health');
const authRoutes = require('./auth');
const userRoutes = require('./user');
const setupRoutes = require('./setup');
const setupSaveRoutes = require('./setupSave');

router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MUSE Music API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      setup: '/api/setup'
    }
  });
});

router.use('/api/health', healthRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/user', userRoutes);
router.use('/api/setup', setupRoutes);
router.use('/api/setup', setupSaveRoutes);

module.exports = router;
