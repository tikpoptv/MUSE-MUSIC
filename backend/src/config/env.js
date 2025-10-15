const { logger } = require('../middleware/logger');

const config = {
  server: {
    port: process.env.BACKEND_PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'muse_music',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  },
  
  jwt: {
    secret: process.env.JWT_SECRET
  },
  
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  
  EMAIL: {
    username: process.env.EMAIL_N8N_USERNAME,
    password: process.env.EMAIL_N8N_PASSWORD,
    webhookUrl: process.env.EMAIL_N8N_WEBHOOK_URL
  },
  n8n: {
    translateWebHook: process.env.TRANSLATE_WEBHOOK
  }
};

const validateConfig = () => {
  const required = [
    'DB_HOST',
    'DB_NAME', 
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.warn('⚠️  Missing environment variables:', missing.join(', '));
    logger.warn('Using default values...');
  }
  
  logger.info('✅ Environment configuration loaded');
  logger.info('📊 Config summary:');
  logger.info(`   Server: ${config.server.nodeEnv} mode on port ${config.server.port}`);
  logger.info(`   Database: ${config.database.name}@${config.database.host}:${config.database.port}`);
  logger.info(`   CORS: ${config.cors.origin}`);
};

module.exports = { config, validateConfig };
