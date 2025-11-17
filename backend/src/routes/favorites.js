const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { addFavorite, removeFavorite, getUserFavorites, checkFavorite } = require('../controllers/favoriteController');

router.post('/', authenticateToken, addFavorite);
router.delete('/', authenticateToken, removeFavorite);
router.get('/', authenticateToken, getUserFavorites);
router.get('/check', authenticateToken, checkFavorite);

module.exports = router;

