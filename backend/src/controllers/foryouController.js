const ForYouService = require('../services/foryouService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');

const getForYouContent = async (req, res) => {
  try {
    const userID = req.user.userID;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const content = await ForYouService.getForYouContent(userID, limit, offset);

    return res.status(200).json(
      successResponse('For You content retrieved successfully', content, 200)
    );
  } catch (error) {
    logger.error('Error in getForYouContent:', error);
    return res.status(500).json(
      errorResponse('Failed to retrieve For You content', 500, error.message)
    );
  }
};

const getYourMood = async (req, res) => {
  try {
    const userID = req.user.userID;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    if (limit < 1 || limit > 200) {
      return res.status(400).json(
        errorResponse('limit must be between 1 and 200', 400)
      );
    }

    const songs = await ForYouService.getYourMood(userID, limit, offset);

    return res.status(200).json(
      successResponse('Your Mood songs retrieved successfully', { songs }, 200)
    );
  } catch (error) {
    logger.error('Error in getYourMood:', error);
    return res.status(500).json(
      errorResponse('Failed to retrieve Your Mood songs', 500, error.message)
    );
  }
};

module.exports = {
  getForYouContent,
  getYourMood
};

