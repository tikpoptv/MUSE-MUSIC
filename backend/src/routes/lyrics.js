const express = require('express');
const router = express.Router();
const LyricsController = require('../controllers/lyricsController');
const enforceFrontendOrigin = require('../middleware/enforceFrontendOrigin');

router.get('/search', enforceFrontendOrigin, LyricsController.search);
router.get('/get', enforceFrontendOrigin, LyricsController.get);
router.get('/get-cached', enforceFrontendOrigin, LyricsController.getCached);
router.get('/get/:id', enforceFrontendOrigin, LyricsController.getById);

module.exports = router;


