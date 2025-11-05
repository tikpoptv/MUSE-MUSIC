const express = require('express');
const router = express.Router();
const { getRecommendHomeContent } = require('../controllers/recommendHomeController');

router.get('/', getRecommendHomeContent);

module.exports = router;

