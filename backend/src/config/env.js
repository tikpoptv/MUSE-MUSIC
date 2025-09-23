const config = {
  server: {
    port: process.env.PORT || 3001,
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
  }
};

const validateConfig = () => {
  const required = [
    'DB_HOST',
    'DB_NAME', 
    'DB_USER',
    'DB_PASSWORD'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('\x1b[33m⚠️  Missing environment variables:\x1b[0m', missing.join(', '));
    console.warn('\x1b[90mUsing default values...\x1b[0m');
  }
  
  console.log('\x1b[32m✅ Environment configuration loaded\x1b[0m');
  console.log('\x1b[90m📊 Config summary:\x1b[0m');
  console.log(`   Server: ${config.server.nodeEnv} mode on port ${config.server.port}`);
  console.log(`   Database: ${config.database.name}@${config.database.host}:${config.database.port}`);
  console.log(`   CORS: ${config.cors.origin}`);
};

module.exports = { config, validateConfig };
