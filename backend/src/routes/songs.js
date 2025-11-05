const express = require('express');
const router = express.Router();
const { getSongDetail, checkProcessingByLanguage } = require('../controllers/songController');

router.get('/:songID', getSongDetail);
router.get('/:songID/check-language', checkProcessingByLanguage);

module.exports = router;

