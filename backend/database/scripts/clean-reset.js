#!/usr/bin/env node
/* eslint-disable no-console */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'muse_music',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT) || 5432,
};

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

class DatabaseCleanResetter {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../migrations');
  }

  async init() {
    console.log(`${colors.red}🔥 MUSE Music Database Clean Reset${colors.reset}`);
    console.log(`${colors.yellow}⚠️  WARNING: This will DELETE ALL DATA and recreate the database!${colors.reset}`);
    console.log(`${colors.blue}📊 Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}${colors.reset}\n`);

    try {
      await this.testConnection();
      await this.cleanDatabase();
      await this.recreateSchema();
      console.log(`\n${colors.green}🎉 Database clean reset completed successfully!${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}❌ Database reset failed:${colors.reset}`, error.message);
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

  async cleanDatabase() {
    console.log(`${colors.yellow}🗑️  Cleaning database...${colors.reset}`);
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get all table names first
      const tablesQuery = `
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `;
      
      const result = await client.query(tablesQuery);
      const tables = result.rows.map(row => row.tablename);
      
      if (tables.length > 0) {
        console.log(`${colors.blue}ℹ️  Found ${tables.length} tables to drop: ${tables.join(', ')}${colors.reset}`);
        
        // Drop all tables with CASCADE
        for (const table of tables) {
          await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        }
        console.log(`${colors.green}✅ Dropped all tables${colors.reset}`);
      } else {
        console.log(`${colors.blue}ℹ️  No tables to drop${colors.reset}`);
      }

      // Drop all functions
      await client.query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');
      await client.query('DROP FUNCTION IF EXISTS update_song_rating_stats() CASCADE');
      await client.query('DROP FUNCTION IF EXISTS update_ai_processing_stats() CASCADE');

      // Drop extensions
      await client.query('DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE');

      await client.query('COMMIT');
      console.log(`${colors.green}✅ Database cleaned successfully${colors.reset}`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async recreateSchema() {
    console.log(`${colors.blue}🔄 Recreating database schema...${colors.reset}`);
    
    const client = await pool.connect();
    try {
      // Read and execute the main migration file
      const migrationFile = path.join(this.migrationsPath, '001_create_initial_schema.sql');
      const migrationContent = fs.readFileSync(migrationFile, 'utf8');
      
      await client.query(migrationContent);
      console.log(`${colors.green}✅ Database schema recreated${colors.reset}`);
      
    } finally {
      client.release();
    }
  }
}

if (require.main === module) {
  const resetter = new DatabaseCleanResetter();
  resetter.init().catch(error => {
    console.error(`${colors.red}💥 Database reset failed:${colors.reset}`, error.message);
    process.exit(1);
  });
}

module.exports = DatabaseCleanResetter;
