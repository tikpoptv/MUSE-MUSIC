const ProcessingService = require('../services/processingService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');
const JWTService = require('../services/jwtService');

const updateYouTubeVideoId = async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = JWTService.extractTokenFromHeader(authHeader);
      if (token) {
        const decoded = JWTService.verifyAccessToken(token);
        if (decoded && decoded.userID) {
          userId = decoded.userID;
        }
      }
    }

    const { processingID } = req.params;
    const { youtubeVideoId } = req.body;

    if (!processingID || processingID === 'undefined') {
      return res.status(400).json(
        errorResponse('processingID is required', 400)
      );
    }

    if (youtubeVideoId && typeof youtubeVideoId !== 'string') {
      return res.status(400).json(
        errorResponse('youtubeVideoId must be a string', 400)
      );
    }

    logger.info('Updating YouTube video ID', {
      processingID,
      userId,
      hasVideoId: !!youtubeVideoId
    });

    const result = await ProcessingService.updateYouTubeVideoId(
      processingID,
      youtubeVideoId || null,
      userId
    );

    return res.json(
      successResponse('YouTube video ID updated successfully', result)
    );

  } catch (error) {
    logger.error('Error in updateYouTubeVideoId:', error);

    if (error.message.includes('required') || error.message.includes('not found')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to update YouTube video ID', 500, error.message)
    );
  }
};

const updateCoverImage = async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = JWTService.extractTokenFromHeader(authHeader);
      if (token) {
        const decoded = JWTService.verifyAccessToken(token);
        if (decoded && decoded.userID) {
          userId = decoded.userID;
        }
      }
    }

    const { processingID } = req.params;
    const { coverImageUrl } = req.body;

    if (!processingID || processingID === 'undefined') {
      return res.status(400).json(
        errorResponse('processingID is required', 400)
      );
    }

    if (coverImageUrl && typeof coverImageUrl !== 'string') {
      return res.status(400).json(
        errorResponse('coverImageUrl must be a string', 400)
      );
    }

    logger.info('Updating cover image', {
      processingID,
      userId,
      hasCoverImage: !!coverImageUrl
    });

    const result = await ProcessingService.updateCoverImage(
      processingID,
      coverImageUrl || null,
      userId
    );

    return res.json(
      successResponse('Cover image updated successfully', result)
    );

  } catch (error) {
    logger.error('Error in updateCoverImage:', error);

    if (error.message.includes('required') || error.message.includes('not found')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to update cover image', 500, error.message)
    );
  }
};

module.exports = {
  updateYouTubeVideoId,
  updateCoverImage
};

