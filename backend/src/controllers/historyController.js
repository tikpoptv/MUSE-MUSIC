const HistoryService = require('../services/historyService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');

const getUserHistory = async (req, res) => {
  try {
    const userID = req.user.userID;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const actionType = req.query.actionType || null;

    if (!userID) {
      return res.status(401).json(
        errorResponse('Authentication required', 401)
      );
    }

    const result = await HistoryService.getUserHistory(userID, page, limit, actionType);

    return res.json(
      successResponse('User history retrieved successfully', result)
    );
  } catch (error) {
    logger.error('Error in getUserHistory:', error);
    return res.status(500).json(
      errorResponse('Failed to retrieve user history', 500, error.message)
    );
  }
};

const saveTranslation = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { songID, processingID } = req.body;

    if (!userID) {
      return res.status(401).json(
        errorResponse('Authentication required', 401)
      );
    }

    if (!songID || !processingID) {
      return res.status(400).json(
        errorResponse('songID and processingID are required', 400)
      );
    }

    const deviceInfo = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
    const result = await HistoryService.recordSaveTranslation(
      userID,
      songID,
      processingID,
      deviceInfo
    );

    if (!result) {
      return res.status(500).json(
        errorResponse('Failed to save translation history', 500)
      );
    }

    return res.json(
      successResponse('Translation saved successfully', result)
    );
  } catch (error) {
    logger.error('Error in saveTranslation:', error);
    return res.status(500).json(
      errorResponse('Failed to save translation', 500, error.message)
    );
  }
};

module.exports = {
  getUserHistory,
  saveTranslation
};

