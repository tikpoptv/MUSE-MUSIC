const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');
const UserService = require('../services/userService');
const UserSettingsService = require('../services/userSettingsService');

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

const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.userID;

    const settingsData = await UserSettingsService.getUserSettings(userId);

    if (!settingsData) {
      return res.status(404).json(
        errorResponse('User not found', 404)
      );
    }

    res.json(successResponse('User settings retrieved successfully', { settings: settingsData }));

  } catch (error) {
    logger.error('Error fetching user settings:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.userID;
    const updateData = req.body;

    const currentUser = await UserSettingsService.getUserSettings(userId);
    if (!currentUser) {
      return res.status(404).json(
        errorResponse('User not found', 404)
      );
    }

    const settingsData = {
      username: updateData.username || currentUser.username,
      email: updateData.email || currentUser.email,
      fullName: updateData.fullName || currentUser.fullName,
      country: updateData.country || currentUser.country,
      timezone: updateData.timezone || currentUser.timezone,
      language: updateData.language || currentUser.language
    };

    if (updateData.username && updateData.username !== currentUser.username) {
      const existingUser = await UserService.findByUsername(updateData.username);
      if (existingUser && existingUser.userID !== userId) {
        return res.status(400).json(
          errorResponse('Username is already taken', 400)
        );
      }
    }

    if (updateData.email && updateData.email !== currentUser.email) {
      const emailExists = await UserService.checkEmailExists(updateData.email);
      if (emailExists) {
        const existingUserByEmail = await UserService.findByEmail(updateData.email);
        if (existingUserByEmail && existingUserByEmail.userID !== userId) {
          return res.status(400).json(
            errorResponse('Email is already taken', 400)
          );
        }
      }
    }

    await UserSettingsService.updateUserSettings(userId, settingsData);

    res.json(successResponse('User settings updated successfully', { settings: settingsData }));

  } catch (error) {
    logger.error('Error updating user settings:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

const resetPassword = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json(
        errorResponse('Current password and new password are required', 400)
      );
    }

    if (newPassword.length < 8) {
      return res.status(400).json(
        errorResponse('New password must be at least 8 characters long', 400)
      );
    }

    if (currentPassword === newPassword) {
      return res.status(400).json(
        errorResponse('New password must be different from current password', 400)
      );
    }

    // Verify current password
    const user = await UserService.findByID(userId);
    if (!user) {
      return res.status(404).json(
        errorResponse('User not found', 404)
      );
    }

    const isCurrentPasswordValid = await UserService.verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json(
        errorResponse('Current password is incorrect', 400)
      );
    }

    // Update password
    await UserService.updatePassword(userId, newPassword);

    res.json(successResponse('Password reset successfully'));

  } catch (error) {
    logger.error('Error resetting password:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

const getUserStats = async (req, res) => {
  try {
    const userId = req.user.userID;

    const stats = await UserService.getUserStats(userId);

    res.json(successResponse('User stats retrieved successfully', { stats }));

  } catch (error) {
    logger.error('Error fetching user stats:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

const acceptTerms = async (req, res) => {
  try {
    const userId = req.user.userID;

    const result = await UserService.acceptTerms(userId);

    if (result === null) {
      return res.status(404).json(
        errorResponse('User not found', 404)
      );
    }

    res.json(successResponse('Terms and conditions accepted successfully'));

  } catch (error) {
    logger.error('Error accepting terms:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

module.exports = {
  getUserData,
  getUserSettings,
  updateUserSettings,
  resetPassword,
  getUserStats,
  acceptTerms
};
