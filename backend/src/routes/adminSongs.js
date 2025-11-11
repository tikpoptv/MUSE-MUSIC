const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const {
  getSongs,
  getPendingCount,
  approveSong,
  rejectSong,
  bulkApprove,
  bulkReject,
  updateLyrics
} = require('../controllers/adminSongsController');

router.get('/', authenticateToken, requireRole(['admin', 'super_admin']), getSongs);
router.get('/pending-count', authenticateToken, requireRole(['admin', 'super_admin']), getPendingCount);
router.post('/:processingID/approve', authenticateToken, requireRole(['admin', 'super_admin']), approveSong);
router.post('/:processingID/reject', authenticateToken, requireRole(['admin', 'super_admin']), rejectSong);
router.post('/bulk-approve', authenticateToken, requireRole(['admin', 'super_admin']), bulkApprove);
router.post('/bulk-reject', authenticateToken, requireRole(['admin', 'super_admin']), bulkReject);
router.put('/:processingID/lyrics', authenticateToken, requireRole(['admin', 'super_admin']), updateLyrics);

module.exports = router;

