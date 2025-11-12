
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
    secret: process.env.JWT_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  },
  
  lrclib: {
    baseUrl: process.env.LRCLIB_BASE_URL || 'https://lrclib.net',
    userAgent: process.env.LRCLIB_USER_AGENT || 'MUSE-MUSIC Backend (https://github.com/tikpoptv/MUSE-MUSIC)'
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
  },
  
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'musemusic.minio.phitik.com',
    port: parseInt(process.env.MINIO_PORT) || 443,
    useSSL: process.env.MINIO_USE_SSL !== 'false',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucketName: process.env.MINIO_BUCKET_NAME || 'muse-music',
    publicUrl: process.env.MINIO_PUBLIC_URL || 'https://musemusic.minio.phitik.com'
  },
  
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY
  }
};

const validateConfig = () => {
  const { logger } = require('../middleware/logger');
  
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
