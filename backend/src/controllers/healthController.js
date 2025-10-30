const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getHealth = async (req, res) => {
  const healthData = {
    status: 'OK',
    message: 'MUSE Music API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: false
  };

  // Check database connection if DB_HOST is configured
  if (process.env.DB_HOST) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      healthData.database = true;
    } catch (error) {
      healthData.database = false;
      healthData.status = 'WARNING';
      healthData.message = 'API running but database connection failed';
    }
  }

  if (healthData.database) {
    res.status(200).json(successResponse('MUSE Music API is running', healthData, 200));
  } else {
    res.status(503).json(errorResponse('API running but database connection failed', 503, healthData));
  }
};

module.exports = {
  getHealth
};
