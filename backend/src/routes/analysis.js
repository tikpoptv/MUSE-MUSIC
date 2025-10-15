const express = require('express');
const router = express.Router();
const { getTranslate } = require('../controllers/translateController.js');

router.post('/translate',getTranslate);

module.exports = router;