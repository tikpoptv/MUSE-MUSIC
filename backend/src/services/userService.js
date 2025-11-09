const DatabaseService = require('./databaseService');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const TwoFactorService = require('./twoFactorService');
const { logger } = require('../middleware/logger');

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
    const result = await DatabaseService.query(query, values);
    
    // Normalize data from database (lowercase) to camelCase for User model
    const userDataFromDB = result.rows[0];
    const normalizedData = {
      userID: userDataFromDB.userid,
      username: userDataFromDB.username,
      email: userDataFromDB.email,
      password: null, // Don't include password in user object
      fullName: userDataFromDB.fullname,
      profilePicture: null,
      provider: userDataFromDB.provider,
      providerID: null,
      providerEmail: null,
      role: userDataFromDB.role,
      loginStatus: null,
      setupCompleted: null,
      setupSkipped: null,
      registerDate: userDataFromDB.registerdate,
      createdAt: userDataFromDB.createdat,
      updatedAt: null
    };
    
    return new User(normalizedData);
  }

  static async findByUsername(username) {
    const query = `
      SELECT userID, username, email, password, fullName, profilePicture, 
             provider, providerID, providerEmail, role, loginStatus, 
             setupCompleted, setupSkipped, registerDate, createdAt, updatedAt
      FROM Users WHERE username = $1
    `;
    const result = await DatabaseService.query(query, [username]);
    
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
    const result = await DatabaseService.query(query, [email]);
    
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
    const result = await DatabaseService.query(query, [userID]);
    
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
    const result = await DatabaseService.query(query, [username]);
    return result.rows.length > 0;
  }

  static async checkEmailExists(email) {
    const query = 'SELECT userID FROM Users WHERE email = $1';
    const result = await DatabaseService.query(query, [email]);
    return result.rows.length > 0;
  }

  static async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async updateLoginStatus(userID, status) {
    const query = 'UPDATE Users SET loginStatus = $1, updatedAt = CURRENT_TIMESTAMP WHERE userID = $2';
    await DatabaseService.query(query, [status, userID]);
  }

  static async createCustomerProfile(userID) {
    const query = `
      INSERT INTO Customers (userID, preferredLanguage, timezone, country)
      VALUES ($1, $2, $3, $4)
      RETURNING customerID
    `;
    
    const values = [userID, 'en', 'UTC', null];
    const result = await DatabaseService.query(query, values);
    
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

  static async storePasswordResetToken(userID, resetToken, resetTokenExpiry) {
    const query = `
      UPDATE Users 
      SET passwordResetToken = $1, passwordResetTokenExpiry = $2, updatedAt = CURRENT_TIMESTAMP 
      WHERE userID = $3
    `;
    await DatabaseService.query(query, [resetToken, resetTokenExpiry, userID]);
  }

  static async findByResetToken(resetToken) {
    const query = `
      SELECT userID, username, email, passwordResetToken, passwordResetTokenExpiry
      FROM Users 
      WHERE passwordResetToken = $1
    `;
    const result = await DatabaseService.query(query, [resetToken]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }

  static async updatePassword(userID, newPassword) {
    const bcrypt = require('bcrypt');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const query = `
      UPDATE Users 
      SET password = $1, updatedAt = CURRENT_TIMESTAMP 
      WHERE userID = $2
    `;
    await DatabaseService.query(query, [hashedPassword, userID]);
  }

  static async clearPasswordResetToken(userID) {
    const query = `
      UPDATE Users 
      SET passwordResetToken = NULL, passwordResetTokenExpiry = NULL, updatedAt = CURRENT_TIMESTAMP 
      WHERE userID = $1
    `;
    await DatabaseService.query(query, [userID]);
  }

  static async getUserWithSetupStatus(userID) {
    const query = `
      SELECT 
        u.userID,
        u.username,
        u.email,
        u.fullName,
        u.provider,
        u.setupCompleted,
        u.setupSkipped,
        u.createdAt,
        u.updatedAt,
        u.password,
        c.DOB as birthday,
        c.preferredLanguage as language,
        c.timezone,
        c.country,
        c.musicInterestTypes
      FROM Users u
      LEFT JOIN Customers c ON u.userID = c.userID
      WHERE u.userID = $1
    `;

    const result = await DatabaseService.query(query, [userID]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    
    // Get 2FA status first (needed for step 2)
    let twoFAStatus = null;
    try {
      twoFAStatus = await TwoFactorService.get2FAStatus(userID);
    } catch (error) {
      // If 2FA is not set up, twoFAStatus will be null
      twoFAStatus = null;
    }
    
    // Build step status and data
    const stepStatus = {
      step1: false,
      step2: false,
      step3: false,
      step4: false,
      step5: false
    };

    const stepData = {
      step1: null,
      step2: null,
      step3: null,
      step4: null,
      step5: null
    };

    // Step 1: Password for Google users
    if (user.provider === 'google') {
      stepStatus.step1 = user.password !== null;
      stepData.step1 = {
        hasPassword: user.password !== null
      };
    } else {
      stepStatus.step1 = true;
      stepData.step1 = {
        hasPassword: true
      };
    }

    // Step 2: Two-Factor Authentication
    if (twoFAStatus && twoFAStatus.twofactorenabled) {
      stepStatus.step2 = true;
      stepData.step2 = {
        twoFactorEnabled: true,
        setupCompleted: twoFAStatus.twoFactorSetupCompleted,
        backupCodesCount: twoFAStatus.backupCodesCount
      };
    } else {
      stepStatus.step2 = false;
      stepData.step2 = {
        twoFactorEnabled: false,
        setupCompleted: false,
        backupCodesCount: 0
      };
    }

    // Step 3: Birthday
    stepStatus.step3 = user.birthday !== null;
    if (user.birthday) {
      stepData.step3 = {
        birthday: user.birthday
      };
    }

    // Step 4: Preferences
    stepStatus.step4 = user.country !== null && user.timezone !== null && user.language !== null;
    if (user.country && user.timezone && user.language) {
      stepData.step4 = {
        country: user.country,
        timezone: user.timezone,
        language: user.language
      };
    }

    // Step 5: Music genres
    stepStatus.step5 = user.musicinteresttypes !== null && user.musicinteresttypes !== undefined && user.musicinteresttypes.length > 0;
    if (user.musicinteresttypes && user.musicinteresttypes.length > 0) {
      stepData.step5 = {
        genres: user.musicinteresttypes
      };
    }

    const allStatus = user.setupcompleted;

    return {
      userID: user.userid,
      username: user.username,
      email: user.email,
      fullName: user.fullname,
      provider: user.provider,
      setupCompleted: user.setupcompleted,
      setupSkipped: user.setupskipped,
      createdAt: user.createdat,
      updatedAt: user.updatedat,
      allStatus,
      stepStatus,
      stepData,
      twoFAStatus
    };
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      const bcrypt = require('bcrypt');
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      logger.error('Error verifying password:', error);
      throw error;
    }
  }

}

module.exports = UserService;
