const express = require('express');
const router = express.Router();

const healthRoutes = require('./health');

router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MUSE Music API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health'
    }
  });
});

router.use('/api/health', healthRoutes);

module.exports = router;
