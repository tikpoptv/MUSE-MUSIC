const express = require('express');
const router = express.Router();

const healthRoutes = require('./health');
const authRoutes = require('./auth');
const userRoutes = require('./user');
const setupRoutes = require('./setup');
const setupSaveRoutes = require('./setupSave');
const translateRoutes = require('./analysis');
const twoFactorRoutes = require('./twoFactor');
const lyricsRoutes = require('./lyrics');
const songsRoutes = require('./songs');
const ratingsRoutes = require('./ratings');
const processingRoutes = require('./processing');
const imagesRoutes = require('./images');
const youtubeRoutes = require('./youtube');

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
router.use('/api/2fa', twoFactorRoutes);
router.use('/api/lyrics', lyricsRoutes);
router.use('/api/songs', songsRoutes);
router.use('/api/ratings', ratingsRoutes);
router.use('/api/processing', processingRoutes);
router.use('/api/images', imagesRoutes);
router.use('/api/youtube', youtubeRoutes);

// Mount analysis
router.use('/api/analysis', translateRoutes);

module.exports = router;
