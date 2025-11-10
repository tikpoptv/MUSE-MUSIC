const express = require('express');
const router = express.Router();
const { createShareLink, getProcessingByShortLink } = require('../controllers/shareController');

router.post('/create', createShareLink);
router.get('/:shortLink', getProcessingByShortLink);

module.exports = router;

