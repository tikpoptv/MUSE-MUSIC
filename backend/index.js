const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { config, validateConfig } = require('./src/config/env');
const corsOptions = require('./src/config/cors');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/middleware/logger');
const routes = require('./src/routes');
const { connectDB } = require('./src/config/database');

const startServer = async () => {
  const app = express();

  validateConfig();

  await connectDB();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(morgan('\x1b[90m:method\x1b[0m \x1b[36m:url\x1b[0m \x1b[33m:status\x1b[0m \x1b[2m:response-time ms\x1b[0m'));
  app.use(logger);
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

  app.listen(config.server.port, () => {
    console.log(`🚀 MUSE Music API server is running on port ${config.server.port}`);
    console.log(`📍 Health check: http://localhost:${config.server.port}/api/health`);
    console.log(`🌍 Environment: ${config.server.nodeEnv}`);
  });

  return app;
};

startServer().catch((error) => {
  console.error('\x1b[31m💥 Failed to start server:\x1b[0m', error.message);
  process.exit(1);
});

module.exports = { startServer };
