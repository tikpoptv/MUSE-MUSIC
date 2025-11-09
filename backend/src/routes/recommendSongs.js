const express = require('express');
const router = express.Router();
const { getRecommendedSongsByLanguageAndMood } = require('../controllers/recommendSongsController');

router.get('/by-language-mood', getRecommendedSongsByLanguageAndMood);

module.exports = router;

