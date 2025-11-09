const { OAuth2Client } = require('google-auth-library');
const { config } = require('../config/env');
const DatabaseService = require('./databaseService');
const UserService = require('./userService');
const SessionService = require('./sessionService');
const JWTService = require('./jwtService');
const EmailService = require('./emailService');
const { logger } = require('../middleware/logger');

class GoogleAuthService {
  static getClient() {
    return new OAuth2Client(config.google.clientId);
  }

  static async verifyGoogleToken(token) {
    try {
      const client = this.getClient();
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.google.clientId,
      });

      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
      };
    } catch (error) {
      return null;
    }
  }

  static async findOrCreateGoogleUser(googleUserData, type = 'login', userId = null) {
    const { googleId, email } = googleUserData;

    if (type === 'link' && userId) {
      // สำหรับ link account ตรวจสอบ Google account ก่อน
      const existingGoogleUser = await this.findByGoogleId(googleId);
      if (existingGoogleUser) {
        throw new Error('This Google account is already linked to another user');
      }
      // สำหรับ link account ให้ใช้ userId ที่ส่งมา
      const user = await UserService.findByID(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // ตรวจสอบว่า user นี้มี Google account แล้วหรือไม่
      if (user.provider === 'google' && user.providerID) {
        throw new Error('This user already has a Google account linked');
      }
      
      return await this.updateUserWithGoogleInfo(user.userID, googleId, email, googleUserData.picture, googleUserData.name);
    } else {
      // สำหรับ login/register ใช้ logic เดียวกัน
      let user = await this.findByGoogleId(googleId);
      
      if (user) {
        return user;
      }
      
      // หา user จาก email
      user = await UserService.findByEmail(email);
      
      if (user) {
        // ตรวจสอบว่า Google account นี้มีเจ้าของแล้วหรือไม่
        const existingGoogleUser = await this.findByGoogleId(googleId);
        if (existingGoogleUser && existingGoogleUser.userID !== user.userID) {
          throw new Error('This Google account is already linked to another user');
        }
        
        return await this.updateUserWithGoogleInfo(user.userID, googleId, email, googleUserData.picture, googleUserData.name);
      }
    }

    return await this.createGoogleUser(googleUserData);
  }

  static async findByGoogleId(googleId) {
    const query = `
      SELECT userID, username, email, password, fullName, profilePicture, 
             provider, providerID, providerEmail, role, loginStatus, 
             setupCompleted, setupSkipped, registerDate, createdAt, updatedAt
      FROM Users WHERE providerID = $1 AND provider = 'google'
    `;
    
    const result = await DatabaseService.query(query, [googleId]);
    
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
    
    return new (require('../models/User'))(normalizedData);
  }

  static async updateUserWithGoogleInfo(userID, googleId, email, picture, fullName = null) {
    const query = `
      UPDATE Users 
      SET provider = 'google', 
          providerID = $1, 
          providerEmail = $2, 
          email = $2,
          profilePicture = $3,
          fullName = CASE 
            WHEN fullName IS NULL OR fullName = '' THEN $4 
            ELSE fullName 
          END,
          updatedAt = CURRENT_TIMESTAMP
      WHERE userID = $5
      RETURNING userID, username, email, fullName, profilePicture, provider, providerID, providerEmail, role, loginStatus, setupCompleted, setupSkipped, registerDate, createdAt, updatedAt
    `;
    
    const result = await DatabaseService.query(query, [googleId, email, picture, fullName, userID]);
    
    if (result.rows.length === 0) {
      throw new Error('Failed to link Google account');
    }
    
    const userData = result.rows[0];
    const normalizedData = {
      userID: userData.userid,
      username: userData.username,
      email: userData.email,
      password: null,
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
    
    return new (require('../models/User'))(normalizedData);
  }

  static async createGoogleUser(googleUserData) {
    const { googleId, email, name, picture } = googleUserData;
    
    const username = email.split('@')[0] + '_' + Date.now();
    
    const query = `
      INSERT INTO Users (username, email, fullName, profilePicture, provider, providerID, providerEmail, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING userID, username, email, fullName, provider, role, registerDate, createdAt
    `;
    
    const values = [username, email, name, picture, 'google', googleId, email, 'customer'];
    const result = await DatabaseService.query(query, values);
    
    const userData = result.rows[0];
    const normalizedData = {
      userID: userData.userid,
      username: userData.username,
      email: userData.email,
      password: null,
      fullName: userData.fullname,
      profilePicture: userData.profilepicture,
      provider: userData.provider,
      providerID: googleId,
      providerEmail: userData.provideremail,
      role: userData.role,
      loginStatus: 'offline',
      setupCompleted: false,
      setupSkipped: false,
      registerDate: userData.registerdate,
      createdAt: userData.createdat,
      updatedAt: userData.createdat
    };
    
    const newUser = new (require('../models/User'))(normalizedData);
    
    // Send welcome email for new Google users
    try {
      await EmailService.sendWelcomeEmail({
        email: userData.email,
        fullName: userData.fullname,
        username: userData.username
      });
      logger.info('Welcome email sent to Google user:', userData.email);
    } catch (emailError) {
      logger.error('Failed to send welcome email to Google user:', emailError);
      // Don't fail user creation if email fails
    }
    
    return newUser;
  }

  static async handleGoogleLogin(googleToken, deviceInfo, ipAddress, userAgent, type = 'login', userId = null) {
    const googleUserData = await this.verifyGoogleToken(googleToken);
    
    if (!googleUserData) {
      throw new Error('Invalid Google token');
    }

    const user = await this.findOrCreateGoogleUser(googleUserData, type, userId);
    
    if (!user) {
      throw new Error('Failed to create or find user');
    }

    await UserService.updateLoginStatus(user.userID, 'online');

    const session = await SessionService.createSession(
      user.userID,
      deviceInfo,
      ipAddress,
      userAgent
    );

    const accessToken = JWTService.generateAccessToken(user.userID, user.username, user.role);
    const refreshToken = JWTService.generateRefreshToken(user.userID);

    return {
      user,
      session,
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: '7d'
      }
    };
  }
}

module.exports = GoogleAuthService;
