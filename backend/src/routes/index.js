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
const recommendHomeRoutes = require('./recommendHome');
const recommendSongsRoutes = require('./recommendSongs');
const shareRoutes = require('./share');
const dashboardRoutes = require('./dashboard');
const adminManageRoutes = require('./adminManage');
const adminSongsRoutes = require('./adminSongs');
const adminAnalysisRoutes = require('./adminAnalysis');
const adminLogsRoutes = require('./adminLogs');
const n8nWorkflowRoutes = require('./n8nWorkflow');
const promptTestRoutes = require('./promptTest');
const promptRoutes = require('./prompts');

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
router.use('/api/home', recommendHomeRoutes);
router.use('/api/recommend', recommendSongsRoutes);
router.use('/api/analysis', translateRoutes);
router.use('/api/share', shareRoutes);
router.use('/api/dashboard', dashboardRoutes);
router.use('/api/admin/manage', adminManageRoutes);
router.use('/api/admin/songs', adminSongsRoutes);
router.use('/api/admin/analysis', adminAnalysisRoutes);
router.use('/api/admin/logs', adminLogsRoutes);
router.use('/api/n8n/workflow', n8nWorkflowRoutes);
router.use('/api/prompt-test', promptTestRoutes);
router.use('/api/prompts', promptRoutes);

module.exports = router;
