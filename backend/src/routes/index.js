const express = require('express');
const router = express.Router();
const enforceFrontendOrigin = require('../middleware/enforceFrontendOrigin');

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
const recommendHomeRoutes = require('./recommendHome');
const recommendSongsRoutes = require('./recommendSongs');
const foryouRoutes = require('./foryou');
const shareRoutes = require('./share');
const dashboardRoutes = require('./dashboard');
const adminManageRoutes = require('./adminManage');
const adminSongsRoutes = require('./adminSongs');
const adminAnalysisRoutes = require('./adminAnalysis');
const adminLogsRoutes = require('./adminLogs');
const n8nWorkflowRoutes = require('./n8nWorkflow');
const promptTestRoutes = require('./promptTest');
const promptRoutes = require('./prompts');
const historyRoutes = require('./history');
const favoritesRoutes = require('./favorites');

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
router.use('/api/user', enforceFrontendOrigin, userRoutes);
router.use('/api/setup', enforceFrontendOrigin, setupRoutes);
router.use('/api/setup', enforceFrontendOrigin, setupSaveRoutes);
router.use('/api/2fa', enforceFrontendOrigin, twoFactorRoutes);
router.use('/api/lyrics', enforceFrontendOrigin, lyricsRoutes);
router.use('/api/songs', enforceFrontendOrigin, songsRoutes);
router.use('/api/ratings', enforceFrontendOrigin, ratingsRoutes);
router.use('/api/processing', enforceFrontendOrigin, processingRoutes);
router.use('/api/images', enforceFrontendOrigin, imagesRoutes);
router.use('/api/youtube', enforceFrontendOrigin, youtubeRoutes);
router.use('/api/home', enforceFrontendOrigin, recommendHomeRoutes);
router.use('/api/recommend', enforceFrontendOrigin, recommendSongsRoutes);
router.use('/api/foryou', enforceFrontendOrigin, foryouRoutes);
router.use('/api/analysis', enforceFrontendOrigin, translateRoutes);
router.use('/api/share', enforceFrontendOrigin, shareRoutes);
router.use('/api/dashboard', enforceFrontendOrigin, dashboardRoutes);
router.use('/api/admin/manage', enforceFrontendOrigin, adminManageRoutes);
router.use('/api/admin/songs', enforceFrontendOrigin, adminSongsRoutes);
router.use('/api/admin/analysis', enforceFrontendOrigin, adminAnalysisRoutes);
router.use('/api/admin/logs', enforceFrontendOrigin, adminLogsRoutes);
router.use('/api/n8n/workflow', enforceFrontendOrigin, n8nWorkflowRoutes);
router.use('/api/prompt-test', enforceFrontendOrigin, promptTestRoutes);
router.use('/api/prompts', enforceFrontendOrigin, promptRoutes);
router.use('/api/history', enforceFrontendOrigin, historyRoutes);
router.use('/api/favorites', enforceFrontendOrigin, favoritesRoutes);

module.exports = router;
