// const { pool } = require('../config/database');
const { logger } = require('../middleware/logger');
const UserService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/response');

const getSetupStatus = async (req, res) => {
  try {
    const userId = req.user.userID;

    const userData = await UserService.getUserWithSetupStatus(userId);

    if (!userData) {
      return res.status(404).json(
        errorResponse('User not found', 404)
      );
    }

    res.json(
      successResponse('Setup status retrieved', {
        allStatus: userData.allStatus,
        stepStatus: userData.stepStatus,
        stepData: userData.stepData,
        setupCompleted: userData.setupCompleted,
        setupSkipped: userData.setupSkipped,
        provider: userData.provider,
        twoFAStatus: userData.twoFAStatus
      })
    );

  } catch (error) {
    logger.error('Error getting setup status:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

module.exports = {
  getSetupStatus
};
