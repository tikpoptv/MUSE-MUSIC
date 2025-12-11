/**
 * Database Seed Script
 * Seeds the database with test data using proper password hashing
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const bcrypt = require('bcrypt');
const { pool } = require('../../src/config/database');
const { logger } = require('../../src/middleware/logger');

// Configuration
const SALT_ROUNDS = 12; // Same as backend

// Seed Data
const seedData = {
  users: [
    {
      username: 'admin',
      email: 'admin@musemusic.com',
      password: 'Admin@123456',
      fullName: 'Admin User',
      role: 'admin',
      provider: 'local',
      termsAccepted: true
    },
    {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'Test@123456',
      fullName: 'Test User',
      role: 'customer',
      provider: 'local',
      termsAccepted: true
    },
    {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'John@123456',
      fullName: 'John Doe',
      role: 'customer',
      provider: 'local',
      termsAccepted: true
    },
    {
      username: 'jane_smith',
      email: 'jane@example.com',
      password: 'Jane@123456',
      fullName: 'Jane Smith',
      role: 'customer',
      provider: 'local',
      termsAccepted: true
    },
    {
      username: 'reviewer',
      email: 'reviewer@musemusic.com',
      password: 'Reviewer@123456',
      fullName: 'Content Reviewer',
      role: 'admin',
      provider: 'local',
      termsAccepted: true
    }
  ]
};

/**
 * Hash password using bcrypt (same as backend)
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Clear existing data
 */
async function clearData(client) {
  logger.info('Clearing existing user data...');
  
  await client.query('TRUNCATE TABLE usersessions CASCADE');
  await client.query('TRUNCATE TABLE twofactorverification CASCADE');
  await client.query('TRUNCATE TABLE Customers CASCADE');
  await client.query('TRUNCATE TABLE Users CASCADE');
  
  logger.info('User data cleared successfully');
}

/**
 * Seed Users table
 */
async function seedUsers(client) {
  logger.info('Seeding users...');
  
  const insertedUsers = [];
  
  for (const user of seedData.users) {
    // Hash password
    const hashedPassword = await hashPassword(user.password);
    
    const query = `
      INSERT INTO Users (
        username, 
        email, 
        password, 
        fullName, 
        role, 
        provider, 
        termsAccepted,
        loginStatus,
        createdAt,
        updatedAt
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'offline', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING userID, username, email, fullName, role, provider
    `;
    
    const values = [
      user.username,
      user.email,
      hashedPassword, // Use hashed password
      user.fullName,
      user.role,
      user.provider,
      user.termsAccepted
    ];
    
    const result = await client.query(query, values);
    insertedUsers.push(result.rows[0]);
    
    logger.info(`✓ Created user: ${user.username} (password: ${user.password})`);
  }
  
  return insertedUsers;
}

/**
 * Seed Customers table
 */
async function seedCustomers(client, users) {
  logger.info('Seeding customers...');
  
  // Only create customer records for non-admin users
  const customerUsers = users.filter(u => u.role === 'customer');
  
  for (const user of customerUsers) {
    const query = `
      INSERT INTO Customers (
        userID,
        DOB,
        country,
        timezone,
        preferredLanguage,
        createdAt,
        updatedAt
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    const dob = new Date(1990 + Math.floor(Math.random() * 20), 
                         Math.floor(Math.random() * 12), 
                         Math.floor(Math.random() * 28) + 1);
    
    const values = [
      user.userid,
      dob.toISOString().split('T')[0],
      'Thailand',
      'Asia/Bangkok',
      'th'
    ];
    
    await client.query(query, values);
    logger.info(`✓ Created customer profile for: ${user.username}`);
  }
}


/**
 * Main seed function
 */
async function seed() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    logger.info('========================================');
    logger.info('Starting user seeding...');
    logger.info('========================================');
    
    // Clear existing data
    await clearData(client);
    
    // Seed users only
    const users = await seedUsers(client);
    await seedCustomers(client, users);
    
    await client.query('COMMIT');
    
    logger.info('========================================');
    logger.info('Users seeded successfully!');
    logger.info('========================================');
    logger.info('\n📋 Test Credentials:\n');
    logger.info('Admin Accounts (2):');
    logger.info('  admin / Admin@123456');
    logger.info('  reviewer / Reviewer@123456\n');
    logger.info('Customer Accounts (3):');
    logger.info('  testuser / Test@123456');
    logger.info('  john_doe / John@123456');
    logger.info('  jane_smith / Jane@123456');
    logger.info('\n✅ All passwords encrypted with bcrypt (saltRounds = 12)');
    logger.info('========================================\n');
    
    return {
      users: users.length,
      customers: users.filter(u => u.role === 'customer').length
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  seed()
    .then((stats) => {
      logger.info(`✓ Seeded ${stats.users} users (${stats.customers} customers)`);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seed };

