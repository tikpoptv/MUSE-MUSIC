#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Support both DATABASE_URL and individual env vars
let dbConfig;
if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL (format: postgresql://user:password@host:port/database)
  const url = new URL(process.env.DATABASE_URL);
  dbConfig = {
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1), // Remove leading '/'
  };
} else {
  // Fallback to individual env vars
  dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'muse_music',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT) || 5432,
  };
}

const pool = new Pool(dbConfig);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../migrations');
    this.migrations = [];
  }

  async init() {
    console.log(`${colors.cyan}🚀 MUSE Music Database Migration${colors.reset}`);
    console.log(`${colors.blue}📊 Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}${colors.reset}\n`);

    try {
      await this.testConnection();
      await this.createMigrationsTable();
      await this.loadMigrations();
      await this.runMigrations();
    } catch (error) {
      console.error(`${colors.red}❌ Migration failed:${colors.reset}`, error.message);
      process.exit(1);
    } finally {
      await pool.end();
    }
  }

  async testConnection() {
    try {
      const client = await pool.connect();
      console.log(`${colors.green}✅ Database connection successful${colors.reset}`);
      client.release();
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async createMigrationsTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations_tracking (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time_ms INTEGER,
        status VARCHAR(20) DEFAULT 'success'
      );
    `;

    await pool.query(createTableQuery);
    console.log(`${colors.green}✅ Migrations tracking table ready${colors.reset}`);
  }

  async loadMigrations() {
    try {
      const files = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const file of files) {
        const filePath = path.join(this.migrationsPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        this.migrations.push({
          filename: file,
          content: content,
          path: filePath
        });
      }

      console.log(`${colors.blue}📁 Found ${this.migrations.length} migration files${colors.reset}`);
    } catch (error) {
      throw new Error(`Failed to load migrations: ${error.message}`);
    }
  }

  async runMigrations() {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      for (const migration of this.migrations) {
        await this.runSingleMigration(client, migration);
      }

      await client.query('COMMIT');
      console.log(`\n${colors.green}🎉 All migrations completed successfully!${colors.reset}`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async runSingleMigration(client, migration) {
    const startTime = Date.now();
    
    try {
      const checkQuery = 'SELECT id FROM migrations_tracking WHERE filename = $1';
      const result = await client.query(checkQuery, [migration.filename]);
      
      if (result.rows.length > 0) {
        console.log(`${colors.yellow}⏭️  Skipping ${migration.filename} (already executed)${colors.reset}`);
        return;
      }

      console.log(`${colors.blue}🔄 Running ${migration.filename}...${colors.reset}`);
      
      await client.query(migration.content);
      
      const executionTime = Date.now() - startTime;
      
      const insertQuery = `
        INSERT INTO migrations_tracking (filename, execution_time_ms, status)
        VALUES ($1, $2, 'success')
      `;
      await client.query(insertQuery, [migration.filename, executionTime]);
      
      console.log(`${colors.green}✅ ${migration.filename} completed in ${executionTime}ms${colors.reset}`);
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      const insertQuery = `
        INSERT INTO migrations_tracking (filename, execution_time_ms, status)
        VALUES ($1, $2, 'failed')
      `;
      await client.query(insertQuery, [migration.filename, executionTime]);
      
      throw new Error(`Migration ${migration.filename} failed: ${error.message}`);
    }
  }
}

if (require.main === module) {
  const runner = new MigrationRunner();
  runner.init().catch(error => {
    console.error(`${colors.red}💥 Migration script failed:${colors.reset}`, error.message);
    process.exit(1);
  });
}

module.exports = MigrationRunner;
