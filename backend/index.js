const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { config, validateConfig } = require('./src/config/env');
const corsOptions = require('./src/config/cors');
const errorHandler = require('./src/middleware/errorHandler');
const { logger } = require('./src/middleware/logger');
const routes = require('./src/routes');
const { connectDB } = require('./src/config/database');

const startServer = async () => {
  const app = express();

  validateConfig();

  // Only connect to database if DB_HOST is provided
  if (process.env.DB_HOST) {
    await connectDB();
  } else {
    logger.info('⚠️  No database configured, running without database');
  }

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(morgan('\x1b[90m:method\x1b[0m \x1b[36m:url\x1b[0m \x1b[33m:status\x1b[0m \x1b[2m:response-time ms\x1b[0m'));
  app.use(require('./src/middleware/logger'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/', routes);

  app.use(errorHandler);

  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.originalUrl
    });
  });

  const port = process.env.BACKEND_PORT || config.server.port;
  app.listen(port, () => {
    logger.info(`🚀 MUSE Music API server is running on port ${port}`);
    logger.info(`📍 Health check: http://localhost:${port}/api/health`);
    logger.info(`🌍 Environment: ${config.server.nodeEnv}`);
  });

  return app;
};

startServer().catch((error) => {
  logger.error('💥 Failed to start server:', error.message);
  process.exit(1);
});

module.exports = { startServer };
