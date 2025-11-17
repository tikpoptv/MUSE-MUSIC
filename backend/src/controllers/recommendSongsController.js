const RecommendSongsService = require('../services/recommendSongsService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');

const getRecommendedSongsByLanguageAndMood = async (req, res) => {
  try {
    const { language, mood, limit, excludeSongID } = req.query;

    const maxLimit = parseInt(limit) || 10;
    if (maxLimit < 1 || maxLimit > 100) {
      return res.status(400).json(
        errorResponse('limit must be between 1 and 100', 400)
      );
    }

    const songs = await RecommendSongsService.getRecommendedSongsByLanguageAndMood(
      language || null,
      mood || null,
      maxLimit,
      excludeSongID || null
    );

    if (songs.length === 0) {
      return res.status(200).json(
        successResponse('No recommended songs found', { songs: [] }, 200)
      );
    }

    return res.status(200).json(
      successResponse('Recommended songs retrieved successfully', { songs }, 200)
    );
  } catch (error) {
    logger.error('Error in getRecommendedSongsByLanguageAndMood:', error);
    return res.status(500).json(
      errorResponse('Failed to retrieve recommended songs', 500, error.message)
    );
  }
};

module.exports = {
  getRecommendedSongsByLanguageAndMood
};

