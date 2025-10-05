const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');
const UserService = require('../services/userService');

const getUserData = async (req, res) => {
  try {
    const userId = req.user.userID;

    const userData = await UserService.getUserWithSetupStatus(userId);

    if (!userData) {
      return res.status(404).json(
        errorResponse('User not found', 404)
      );
    }

    res.json(successResponse(userData));

  } catch (error) {
    logger.error('Error fetching user data:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

module.exports = {
  getUserData
};
