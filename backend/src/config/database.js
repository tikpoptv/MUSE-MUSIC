const { Pool } = require('pg');
const { config } = require('./env');
const { logger } = require('../middleware/logger');

const pool = new Pool({
  user: config.database.user,
  host: config.database.host,
  database: config.database.name,
  password: config.database.password,
  port: config.database.port,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  logger.info('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('❌ PostgreSQL connection error:', err);
  process.exit(-1);
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    logger.info('🔗 PostgreSQL connection established');
    client.release();
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    logger.error('💥 Server cannot start without database connection');
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
