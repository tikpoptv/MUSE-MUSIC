const multer = require('multer');
const minioService = require('../services/minioService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPG, PNG, GIF, WebP)'), false);
    }
  }
});

const uploadImage = async (req, res) => {
  try {
    if (!minioService.isInitialized()) {
      return res.status(503).json(
        errorResponse('Image upload service is not available. MinIO is not configured.', 503)
      );
    }

    if (!req.file) {
      return res.status(400).json(
        errorResponse('No image file provided or file was rejected', 400)
      );
    }

    const file = req.file;
    const result = await minioService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    logger.info('Image uploaded successfully', { 
      objectName: result.objectName,
      userId: req.user?.userID 
    });

    return res.json(
      successResponse('Image uploaded successfully', result)
    );
  } catch (error) {
    logger.error('Error in uploadImage:', error);

    if (error.message.includes('Only image files')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    if (error.message.includes('File too large') || error.message.includes('limit')) {
      return res.status(400).json(
        errorResponse('File size exceeds the maximum limit of 5MB', 400)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to upload image', 500, error.message)
    );
  }
};

const deleteImage = async (req, res) => {
  try {
    if (!minioService.isInitialized()) {
      return res.status(503).json(
        errorResponse('Image service is not available. MinIO is not configured.', 503)
      );
    }

    const { url } = req.body;

    if (!url) {
      return res.status(400).json(
        errorResponse('Image URL is required', 400)
      );
    }

    let objectName = null;
    
    if (url.includes('/api/images/')) {
      objectName = url.split('/api/images/')[1];
      if (objectName && objectName.includes('?')) {
        objectName = objectName.split('?')[0];
      }
    } else if (url.startsWith('/api/images/')) {
      objectName = url.replace('/api/images/', '');
      if (objectName && objectName.includes('?')) {
        objectName = objectName.split('?')[0];
      }
    } else {
      objectName = minioService.extractObjectNameFromUrl(url);
    }

    if (!objectName) {
      logger.error('Failed to extract objectName from URL:', { url });
      return res.status(400).json(
        errorResponse('Invalid image URL - could not extract object name', 400)
      );
    }

    await minioService.deleteFile(objectName);

    logger.info('Image moved to deleted folder', { 
      objectName,
      userId: req.user?.userID 
    });

    return res.json(
      successResponse('Image deleted successfully')
    );
  } catch (error) {
    logger.error('Error in deleteImage:', error);

    return res.status(500).json(
      errorResponse('Failed to delete image', 500, error.message)
    );
  }
};

const getImage = async (req, res) => {
  try {
    if (!minioService.isInitialized()) {
      return res.status(503).json(
        errorResponse('Image service is not available. MinIO is not configured.', 503)
      );
    }

    const { objectName } = req.params;

    if (!objectName) {
      return res.status(400).json(
        errorResponse('Object name is required', 400)
      );
    }

    if (objectName.startsWith('del/')) {
      return res.status(404).send('Image not found');
    }

    const fileBuffer = await minioService.getFile(objectName);

    let contentType = 'image/jpeg';
    if (objectName.endsWith('.png')) {
      contentType = 'image/png';
    } else if (objectName.endsWith('.gif')) {
      contentType = 'image/gif';
    } else if (objectName.endsWith('.webp')) {
      contentType = 'image/webp';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Content-Length', fileBuffer.length);
    res.send(fileBuffer);

    logger.info('Image served successfully', { 
      objectName,
      size: fileBuffer.length 
    });
  } catch (error) {
    logger.error('Error in getImage:', error);

    if (error.message.includes('not found') || error.code === 'NoSuchKey') {
      return res.status(404).send('Image not found');
    }

    return res.status(500).send('Failed to get image');
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  getImage,
  uploadMiddleware: upload.single('image')
};

