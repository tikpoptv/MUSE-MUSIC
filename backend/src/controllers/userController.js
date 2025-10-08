const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');
const UserService = require('../services/userService');

const getUserData = async (req, res) => {
  try {
    const userId = req.user.userID;

    const user = await UserService.findByID(userId);

    if (!user) {
      return res.status(404).json(
        errorResponse('User not found', 404)
      );
    }

    const responseData = {
      user: user.toJSON()
    };

    res.json(successResponse('User data retrieved successfully', responseData));

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
