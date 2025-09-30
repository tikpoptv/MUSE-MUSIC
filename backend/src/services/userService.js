const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const User = require('../models/User');

class UserService {
  static async createUser(userData) {
    const { username, email = null, password, fullName = null } = userData;
    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO Users (username, email, password, fullName, provider, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING userID, username, email, fullName, provider, role, registerDate, createdAt
    `;
    
    const values = [username, email, hashedPassword, fullName, 'local', 'customer'];
    const result = await pool.query(query, values);
    
    return new User(result.rows[0]);
  }

  static async findByUsername(username) {
    const query = `
      SELECT userID, username, email, password, fullName, profilePicture, 
             provider, providerID, providerEmail, role, loginStatus, 
             setupCompleted, setupSkipped, registerDate, createdAt, updatedAt
      FROM Users WHERE username = $1
    `;
    const result = await pool.query(query, [username]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const userData = result.rows[0];
    const normalizedData = {
      userID: userData.userid,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      fullName: userData.fullname,
      profilePicture: userData.profilepicture,
      provider: userData.provider,
      providerID: userData.providerid,
      providerEmail: userData.provideremail,
      role: userData.role,
      loginStatus: userData.loginstatus,
      setupCompleted: userData.setupcompleted,
      setupSkipped: userData.setupskipped,
      registerDate: userData.registerdate,
      createdAt: userData.createdat,
      updatedAt: userData.updatedat
    };
    
    return new User(normalizedData);
  }

  static async findByEmail(email) {
    const query = `
      SELECT userID, username, email, password, fullName, profilePicture, 
             provider, providerID, providerEmail, role, loginStatus, 
             setupCompleted, setupSkipped, registerDate, createdAt, updatedAt
      FROM Users WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const userData = result.rows[0];
    const normalizedData = {
      userID: userData.userid,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      fullName: userData.fullname,
      profilePicture: userData.profilepicture,
      provider: userData.provider,
      providerID: userData.providerid,
      providerEmail: userData.provideremail,
      role: userData.role,
      loginStatus: userData.loginstatus,
      setupCompleted: userData.setupcompleted,
      setupSkipped: userData.setupskipped,
      registerDate: userData.registerdate,
      createdAt: userData.createdat,
      updatedAt: userData.updatedat
    };
    
    return new User(normalizedData);
  }

  static async findByID(userID) {
    const query = `
      SELECT userID, username, email, password, fullName, profilePicture, 
             provider, providerID, providerEmail, role, loginStatus, 
             setupCompleted, setupSkipped, registerDate, createdAt, updatedAt
      FROM Users WHERE userID = $1
    `;
    const result = await pool.query(query, [userID]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const userData = result.rows[0];
    const normalizedData = {
      userID: userData.userid,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      fullName: userData.fullname,
      profilePicture: userData.profilepicture,
      provider: userData.provider,
      providerID: userData.providerid,
      providerEmail: userData.provideremail,
      role: userData.role,
      loginStatus: userData.loginstatus,
      setupCompleted: userData.setupcompleted,
      setupSkipped: userData.setupskipped,
      registerDate: userData.registerdate,
      createdAt: userData.createdat,
      updatedAt: userData.updatedat
    };
    
    return new User(normalizedData);
  }

  static async checkUsernameExists(username) {
    const query = 'SELECT userID FROM Users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows.length > 0;
  }

  static async checkEmailExists(email) {
    const query = 'SELECT userID FROM Users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  }

  static async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async updateLoginStatus(userID, status) {
    const query = 'UPDATE Users SET loginStatus = $1, updatedAt = CURRENT_TIMESTAMP WHERE userID = $2';
    await pool.query(query, [status, userID]);
  }

  static async createCustomerProfile(userID) {
    const query = `
      INSERT INTO Customers (userID, preferredLanguage, timezone, country)
      VALUES ($1, $2, $3, $4)
      RETURNING customerID
    `;
    
    const values = [userID, 'en', 'UTC', null];
    const result = await pool.query(query, values);
    
    return result.rows[0].customerID;
  }

  static async authenticateUser(username, password) {
    const user = await this.findByUsername(username);
    
    if (!user) {
      return null;
    }
    
    const isValidPassword = await this.validatePassword(password, user.password);
    
    if (!isValidPassword) {
      return null;
    }
    
    return user;
  }
}

module.exports = UserService;
