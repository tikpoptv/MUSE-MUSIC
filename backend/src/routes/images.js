const express = require('express');
const router = express.Router();
const { requireAccessToken } = require('../middleware/authMiddleware');
const { uploadImage, deleteImage, getImage, uploadMiddleware } = require('../controllers/imageController');
const multerErrorHandler = require('../middleware/multerErrorHandler');

router.post('/upload', requireAccessToken, uploadMiddleware, multerErrorHandler, uploadImage);
router.delete('/delete', requireAccessToken, deleteImage);
router.get('/:objectName(*)', getImage);

module.exports = router;

