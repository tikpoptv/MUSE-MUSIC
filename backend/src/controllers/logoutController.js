const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');
const { logger } = require('../middleware/logger');
const { successResponse, errorResponse } = require('../utils/response');

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json(
        errorResponse('No token provided', 401)
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json(
        errorResponse('Invalid token', 401)
      );
    }

    const userID = decoded.userID;

    const deactivateSessionsQuery = `
      UPDATE UserSessions 
      SET isActive = FALSE, updatedAt = CURRENT_TIMESTAMP 
      WHERE userID = $1 AND isActive = TRUE
    `;
    
    await pool.query(deactivateSessionsQuery, [userID]);

    const updateUserStatusQuery = `
      UPDATE Users 
      SET loginStatus = 'offline', updatedAt = CURRENT_TIMESTAMP 
      WHERE userID = $1
    `;
    
    await pool.query(updateUserStatusQuery, [userID]);

    res.json(successResponse('Logged out successfully'));

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

module.exports = {
  logout
};
