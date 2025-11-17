const express = require('express');
const router = express.Router();
const { getSongDetail, checkProcessingByLanguage, searchSongs } = require('../controllers/songController');
const { optionalAuthenticate } = require('../middleware/authMiddleware');

router.get('/search', searchSongs);
router.get('/:songID', optionalAuthenticate, getSongDetail);
router.get('/:songID/check-language', checkProcessingByLanguage);

module.exports = router;

