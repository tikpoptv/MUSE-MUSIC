const LogService = require('../services/logService');
const { logger } = require('../middleware/logger');
const { successResponse, errorResponse } = require('../utils/response');

const getLogs = async (req, res) => {
  try {
    const {
      level,
      category,
      userID,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const filters = {
      level,
      category,
      userID,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      search,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    const result = await LogService.getLogs(filters);

    return res.json(
      successResponse('Logs retrieved successfully', result)
    );
  } catch (error) {
    logger.error('Error in getLogs controller:', error);
    return res.status(500).json(
      errorResponse('Failed to retrieve logs', 500, error.message)
    );
  }
};

const getLogStats = async (req, res) => {
  try {
    const stats = await LogService.getLogStats();

    return res.json(
      successResponse('Log statistics retrieved successfully', stats)
    );
  } catch (error) {
    logger.error('Error in getLogStats controller:', error);
    return res.status(500).json(
      errorResponse('Failed to retrieve log statistics', 500, error.message)
    );
  }
};

module.exports = {
  getLogs,
  getLogStats
};

