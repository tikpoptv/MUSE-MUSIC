const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
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

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  logout
};
