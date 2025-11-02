const RatingService = require('../services/ratingService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');

const submitRating = async (req, res) => {
  try {
    const { processingID } = req.params;
    const { rating, comment } = req.body;
    const userID = req.user?.userID;

    if (!processingID || processingID === 'undefined') {
      return res.status(400).json(
        errorResponse('processingID is required', 400)
      );
    }

    if (!userID) {
      return res.status(401).json(
        errorResponse('Authentication required to submit rating', 401)
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json(
        errorResponse('Rating must be between 1 and 5', 400)
      );
    }

    logger.info('Submitting rating', { processingID, userID, rating });

    const result = await RatingService.submitRating(
      processingID,
      userID,
      rating,
      comment || null
    );

    return res.json(
      successResponse('Rating submitted successfully', result)
    );
  } catch (error) {
    logger.error('Error in submitRating:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json(
        errorResponse(error.message, 404)
      );
    }

    if (error.message.includes('must be between')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to submit rating', 500, error.message)
    );
  }
};

const getRatingStats = async (req, res) => {
  try {
    const { processingID } = req.params;

    if (!processingID || processingID === 'undefined') {
      return res.status(400).json(
        errorResponse('processingID is required', 400)
      );
    }

    logger.info('Fetching rating stats', { processingID });

    const stats = await RatingService.getRatingStats(processingID);

    return res.json(
      successResponse('Rating statistics fetched successfully', stats)
    );
  } catch (error) {
    logger.error('Error in getRatingStats:', error);

    return res.status(500).json(
      errorResponse('Failed to fetch rating statistics', 500, error.message)
    );
  }
};

const getUserRating = async (req, res) => {
  try {
    const { processingID } = req.params;
    const userID = req.user?.userID;

    if (!userID) {
      return res.status(401).json(
        errorResponse('Authentication required', 401)
      );
    }

    if (!processingID || processingID === 'undefined') {
      return res.status(400).json(
        errorResponse('processingID is required', 400)
      );
    }

    logger.info('Fetching user rating', { processingID, userID });

    const rating = await RatingService.getUserRating(processingID, userID);

    return res.json(
      successResponse('User rating fetched successfully', rating)
    );
  } catch (error) {
    logger.error('Error in getUserRating:', error);

    return res.status(500).json(
      errorResponse('Failed to fetch user rating', 500, error.message)
    );
  }
};

module.exports = {
  submitRating,
  getRatingStats,
  getUserRating
};

