const express = require('express');
const router = express.Router();
const LyricsController = require('../controllers/lyricsController');

router.get('/search', LyricsController.search);
router.get('/get', LyricsController.get);
router.get('/get-cached', LyricsController.getCached);
router.get('/get/:id', LyricsController.getById);

module.exports = router;
