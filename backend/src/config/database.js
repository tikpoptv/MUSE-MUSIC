const { Pool } = require('pg');
const { config } = require('./env');

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
  console.log('\x1b[32m✅ Connected to PostgreSQL database\x1b[0m');
});

pool.on('error', (err) => {
  console.error('\x1b[31m❌ PostgreSQL connection error:\x1b[0m', err);
  process.exit(-1);
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('\x1b[36m🔗 PostgreSQL connection established\x1b[0m');
    client.release();
  } catch (error) {
    console.error('\x1b[31m❌ Database connection failed:\x1b[0m', error.message);
    console.error('\x1b[31m💥 Server cannot start without database connection\x1b[0m');
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
