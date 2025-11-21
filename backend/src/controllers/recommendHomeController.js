const RecommendHomeService = require('../services/recommendHomeService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');

const getRecommendHomeContent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const homeContent = await RecommendHomeService.getRecommendedSongs(limit, offset);

    const hasSections = homeContent.sections && homeContent.sections.length > 0;

    if (!hasSections) {
      return res.status(200).json(
        successResponse('No recommended songs available at this time', homeContent, 200)
      );
    }

    return res.status(200).json(
      successResponse('Home content retrieved successfully', homeContent, 200)
    );
  } catch (error) {
    logger.error('Error in getRecommendHomeContent:', error);
    return res.status(500).json(
      errorResponse('Failed to retrieve home content', 500, error.message)
    );
  }
};

module.exports = {
  getRecommendHomeContent
};

