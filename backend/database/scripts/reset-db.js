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

class DatabaseResetter {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../migrations');
  }

  async init() {
    console.log(`${colors.red}🔥 MUSE Music Database Reset${colors.reset}`);
    console.log(`${colors.yellow}⚠️  WARNING: This will DELETE ALL DATA and recreate the database!${colors.reset}`);
    console.log(`${colors.blue}📊 Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}${colors.reset}\n`);

    try {
      await this.testConnection();
      await this.dropAllTables();
      await this.dropAllFunctions();
      await this.dropAllExtensions();
      await this.recreateDatabase();
      console.log(`\n${colors.green}🎉 Database reset completed successfully!${colors.reset}`);
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

  async dropAllTables() {
    console.log(`${colors.yellow}🗑️  Dropping all tables...${colors.reset}`);
    
    const client = await pool.connect();
    try {
      // Get all table names
      const tablesQuery = `
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename != 'migrations_tracking'
      `;
      
      const result = await client.query(tablesQuery);
      const tables = result.rows.map(row => row.tablename);
      
      if (tables.length > 0) {
        // Drop all tables with CASCADE to handle foreign key constraints
        const dropQuery = `DROP TABLE IF EXISTS ${tables.join(', ')} CASCADE`;
        await client.query(dropQuery);
        console.log(`${colors.green}✅ Dropped ${tables.length} tables${colors.reset}`);
      } else {
        console.log(`${colors.blue}ℹ️  No tables to drop${colors.reset}`);
      }
    } finally {
      client.release();
    }
  }

  async dropAllFunctions() {
    console.log(`${colors.yellow}🗑️  Dropping all functions...${colors.reset}`);
    
    const client = await pool.connect();
    try {
      // Get all function names
      const functionsQuery = `
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc 
        WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND proname NOT LIKE 'pg_%'
      `;
      
      const result = await client.query(functionsQuery);
      
      if (result.rows.length > 0) {
        for (const func of result.rows) {
          const dropQuery = `DROP FUNCTION IF EXISTS ${func.proname}(${func.args}) CASCADE`;
          await client.query(dropQuery);
        }
        console.log(`${colors.green}✅ Dropped ${result.rows.length} functions${colors.reset}`);
      } else {
        console.log(`${colors.blue}ℹ️  No functions to drop${colors.reset}`);
      }
    } finally {
      client.release();
    }
  }

  async dropAllExtensions() {
    console.log(`${colors.yellow}🗑️  Dropping extensions...${colors.reset}`);
    
    const client = await pool.connect();
    try {
      // Drop uuid-ossp extension if it exists
      await client.query('DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE');
      console.log(`${colors.green}✅ Dropped extensions${colors.reset}`);
    } finally {
      client.release();
    }
  }

  async recreateDatabase() {
    console.log(`${colors.blue}🔄 Recreating database schema...${colors.reset}`);
    
    const client = await pool.connect();
    try {
      // Read and execute the main migration file
      const migrationFile = path.join(this.migrationsPath, '001_create_initial_schema.sql');
      const migrationContent = fs.readFileSync(migrationFile, 'utf8');
      
      await client.query(migrationContent);
      console.log(`${colors.green}✅ Database schema recreated${colors.reset}`);
      
      // Clear migrations tracking table
      await client.query('DELETE FROM migrations_tracking');
      console.log(`${colors.green}✅ Migrations tracking cleared${colors.reset}`);
      
    } finally {
      client.release();
    }
  }
}

if (require.main === module) {
  const resetter = new DatabaseResetter();
  resetter.init().catch(error => {
    console.error(`${colors.red}💥 Database reset failed:${colors.reset}`, error.message);
    process.exit(1);
  });
}

module.exports = DatabaseResetter;
