const getHealth = (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MUSE Music API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
};

module.exports = {
  getHealth
};
