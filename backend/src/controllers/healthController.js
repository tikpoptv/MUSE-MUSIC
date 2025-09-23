const { pool } = require('../config/database');

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

  const statusCode = healthData.database ? 200 : 503;
  res.status(statusCode).json(healthData);
};

module.exports = {
  getHealth
};
