const FavoriteService = require('../services/favoriteService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');

const addFavorite = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { processingID } = req.body;

    if (!userID) {
      return res.status(401).json(
        errorResponse('Authentication required', 401)
      );
    }

    if (!processingID) {
      return res.status(400).json(
        errorResponse('processingID is required', 400)
      );
    }

    const result = await FavoriteService.addFavorite(userID, processingID);

    if (!result) {
      return res.status(500).json(
        errorResponse('Failed to add favorite', 500)
      );
    }

    return res.json(
      successResponse(result.isNew ? 'Favorite added successfully' : 'Song already favorited', result)
    );
  } catch (error) {
    logger.error('Error in addFavorite:', error);
    return res.status(500).json(
      errorResponse('Failed to add favorite', 500, error.message)
    );
  }
};

const removeFavorite = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { processingID } = req.body;

    if (!userID) {
      return res.status(401).json(
        errorResponse('Authentication required', 401)
      );
    }

    if (!processingID) {
      return res.status(400).json(
        errorResponse('processingID is required', 400)
      );
    }

    const removed = await FavoriteService.removeFavorite(userID, processingID);

    if (!removed) {
      return res.status(404).json(
        errorResponse('Favorite not found', 404)
      );
    }

    return res.json(
      successResponse('Favorite removed successfully', { removed: true })
    );
  } catch (error) {
    logger.error('Error in removeFavorite:', error);
    return res.status(500).json(
      errorResponse('Failed to remove favorite', 500, error.message)
    );
  }
};

const getUserFavorites = async (req, res) => {
  try {
    const userID = req.user.userID;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!userID) {
      return res.status(401).json(
        errorResponse('Authentication required', 401)
      );
    }

    const result = await FavoriteService.getUserFavorites(userID, page, limit);

    return res.json(
      successResponse('User favorites retrieved successfully', result)
    );
  } catch (error) {
    logger.error('Error in getUserFavorites:', error);
    return res.status(500).json(
      errorResponse('Failed to retrieve user favorites', 500, error.message)
    );
  }
};

const checkFavorite = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { processingID } = req.query;

    if (!userID) {
      return res.status(401).json(
        errorResponse('Authentication required', 401)
      );
    }

    if (!processingID) {
      return res.status(400).json(
        errorResponse('processingID is required', 400)
      );
    }

    const isFavorite = await FavoriteService.isFavorite(userID, processingID);

    return res.json(
      successResponse('Favorite status retrieved successfully', { isFavorite })
    );
  } catch (error) {
    logger.error('Error in checkFavorite:', error);
    return res.status(500).json(
      errorResponse('Failed to check favorite status', 500, error.message)
    );
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  checkFavorite
};

