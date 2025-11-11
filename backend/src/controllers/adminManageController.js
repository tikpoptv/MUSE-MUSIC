const AdminManageService = require('../services/adminManageService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');

const getAdminUsers = async (req, res) => {
  try {
    const users = await AdminManageService.getAdminUsers();
    return res.json(
      successResponse('Admin users retrieved successfully', users)
    );
  } catch (error) {
    logger.error('Error in getAdminUsers:', error);
    return res.status(500).json(
      errorResponse('Failed to retrieve admin users', 500, error.message)
    );
  }
};

const addAdminUser = async (req, res) => {
  try {
    const { email, role = 'admin' } = req.body;

    if (!email) {
      return res.status(400).json(
        errorResponse('Email is required', 400)
      );
    }

    const user = await AdminManageService.addAdminUser(email, role);
    return res.json(
      successResponse('Admin user added successfully', user)
    );
  } catch (error) {
    logger.error('Error in addAdminUser:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                      error.message.includes('already') ? 409 : 500;
    return res.status(statusCode).json(
      errorResponse(error.message || 'Failed to add admin user', statusCode)
    );
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userID } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json(
        errorResponse('Role is required', 400)
      );
    }

    const user = await AdminManageService.updateUserRole(userID, role);
    return res.json(
      successResponse('User role updated successfully', user)
    );
  } catch (error) {
    logger.error('Error in updateUserRole:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                      error.message.includes('already') ? 409 : 500;
    return res.status(statusCode).json(
      errorResponse(error.message || 'Failed to update user role', statusCode)
    );
  }
};

const removeAdmin = async (req, res) => {
  try {
    const { userID } = req.params;

    const user = await AdminManageService.removeAdmin(userID);
    return res.json(
      successResponse('Admin removed successfully', user)
    );
  } catch (error) {
    logger.error('Error in removeAdmin:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                      error.message.includes('not an admin') ? 400 : 500;
    return res.status(statusCode).json(
      errorResponse(error.message || 'Failed to remove admin', statusCode)
    );
  }
};

module.exports = {
  getAdminUsers,
  addAdminUser,
  updateUserRole,
  removeAdmin
};

