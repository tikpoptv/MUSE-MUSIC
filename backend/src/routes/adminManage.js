const express = require('express');
const router = express.Router();
const { getAdminUsers, addAdminUser, updateUserRole, removeAdmin } = require('../controllers/adminManageController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, requireRole(['admin', 'super_admin']), getAdminUsers);
router.post('/', authenticateToken, requireRole(['admin', 'super_admin']), addAdminUser);
router.put('/:userID', authenticateToken, requireRole(['admin', 'super_admin']), updateUserRole);
router.delete('/:userID', authenticateToken, requireRole(['admin', 'super_admin']), removeAdmin);

module.exports = router;

