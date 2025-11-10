const ShareService = require('../services/shareService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');
const JWTService = require('../services/jwtService');

const createShareLink = async (req, res) => {
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

    const { processingID } = req.body;

    if (!processingID || processingID === 'undefined') {
      return res.status(400).json(
        errorResponse('processingID is required', 400)
      );
    }

    logger.info('Creating share link', { processingID, userId });

    const result = await ShareService.createShareLink(processingID, userId);

    return res.json(
      successResponse(
        result.alreadyExists ? 'Share link already exists' : 'Share link created successfully',
        result
      )
    );
  } catch (error) {
    logger.error('Error in createShareLink:', error);

    if (error.message.includes('required') || error.message.includes('not found')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to create share link', 500, error.message)
    );
  }
};

const getProcessingByShortLink = async (req, res) => {
  try {
    const { shortLink } = req.params;

    if (!shortLink) {
      return res.status(400).json(
        errorResponse('shortLink is required', 400)
      );
    }

    logger.info('Getting processing by short link', { shortLink });

    const processing = await ShareService.getProcessingByShortLink(shortLink);

    if (!processing) {
      return res.status(404).json(
        errorResponse('Processing not found or not publicly shared', 404)
      );
    }

    return res.json(
      successResponse('Processing retrieved successfully', { processing })
    );
  } catch (error) {
    logger.error('Error in getProcessingByShortLink:', error);

    if (error.message.includes('required')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to retrieve processing', 500, error.message)
    );
  }
};

module.exports = {
  createShareLink,
  getProcessingByShortLink
};

