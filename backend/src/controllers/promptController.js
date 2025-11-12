const PromptService = require('../services/promptService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');
const JWTService = require('../services/jwtService');

/**
 * Save prompt to production workflow and database
 * @route POST /api/prompts/save
 */
const savePrompt = async (req, res) => {
  try {
    // Extract user ID from JWT
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

    const { promptText } = req.body;

    // Validation
    if (!promptText || typeof promptText !== 'string') {
      return res.status(400).json(
        errorResponse('promptText is required and must be a string', 400)
      );
    }

    if (promptText.trim().length === 0) {
      return res.status(400).json(
        errorResponse('promptText cannot be empty', 400)
      );
    }

    logger.info('Saving prompt', {
      userId,
      promptLength: promptText.length
    });

    const result = await PromptService.savePrompt(promptText, userId);

    return res.status(200).json(
      successResponse(result.message, result.data, 200)
    );

  } catch (error) {
    logger.error('Error in savePrompt controller:', error);
    return res.status(500).json(
      errorResponse(error.message || 'Failed to save prompt', 500)
    );
  }
};

module.exports = {
  savePrompt
};

