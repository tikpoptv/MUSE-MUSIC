// const { pool } = require('../config/database');
const { logger } = require('../middleware/logger');
const UserService = require('../services/userService');

const getSetupStatus = async (req, res) => {
  try {
    const userId = req.user.userID;

    const userData = await UserService.getUserWithSetupStatus(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        allStatus: userData.allStatus,
        stepStatus: userData.stepStatus,
        stepData: userData.stepData,
        setupCompleted: userData.setupCompleted,
        setupSkipped: userData.setupSkipped,
        provider: userData.provider,
        twoFAStatus: userData.twoFAStatus
      }
    });

  } catch (error) {
    logger.error('Error getting setup status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getSetupStatus
};
