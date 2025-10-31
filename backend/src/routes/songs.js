const express = require('express');
const router = express.Router();
const { getSongDetail } = require('../controllers/songController');

router.get('/:songID', getSongDetail);

module.exports = router;

