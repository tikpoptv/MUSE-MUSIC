const PromptTestService = require('../services/promptTestService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');
const JWTService = require('../services/jwtService');

/**
 * Test a new prompt against the original
 * @route POST /api/prompt-test/test
 */
const testPrompt = async (req, res) => {
  try {
    // Extract user ID from JWT (if available)
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

    const { 
      newPromptText,
      lyrics,
      language1,
      language2,
      moodEnabled,
      moodTopK
    } = req.body;

    // Validation
    if (!newPromptText || typeof newPromptText !== 'string') {
      return res.status(400).json(
        errorResponse('newPromptText is required and must be a string', 400)
      );
    }

    if (!lyrics || typeof lyrics !== 'string') {
      return res.status(400).json(
        errorResponse('lyrics is required and must be a string', 400)
      );
    }

    if (!language1 || !language2) {
      return res.status(400).json(
        errorResponse('language1 and language2 are required', 400)
      );
    }

    logger.info('Testing prompt', {
      userId,
      newPromptLength: newPromptText.length,
      lyricsLength: lyrics.length,
      language1,
      language2,
      moodEnabled,
      moodTopK
    });

    // Debug: Log first 200 characters of prompt to check for issues
    logger.info('Prompt preview (first 200 chars):', {
      prompt: newPromptText.substring(0, 200),
      hasLeadingSpace: newPromptText.startsWith(' '),
      hasLeadingNewline: newPromptText.startsWith('\n'),
      firstCharCode: newPromptText.charCodeAt(0)
    });

    const result = await PromptTestService.testPrompt({
      newPromptText,
      lyrics,
      language1,
      language2,
      moodEnabled: moodEnabled !== undefined ? moodEnabled : true,
      moodTopK: moodTopK || 4,
      userId
    });

    return res.status(200).json(
      successResponse('Prompt test completed successfully', result, 200)
    );

  } catch (error) {
    logger.error('Error in testPrompt controller:', error);
    return res.status(500).json(
      errorResponse(error.message || 'Failed to test prompt', 500)
    );
  }
};

module.exports = {
  testPrompt
};

