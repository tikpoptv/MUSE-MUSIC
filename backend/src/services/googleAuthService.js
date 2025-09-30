const { OAuth2Client } = require('google-auth-library');
const { config } = require('../config/env');
const UserService = require('./userService');
const SessionService = require('./sessionService');
const JWTService = require('./jwtService');

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

  static async findOrCreateGoogleUser(googleUserData) {
    const { googleId, email } = googleUserData;

    let user = await this.findByGoogleId(googleId);
    
    if (user) {
      return user;
    }

    user = await UserService.findByEmail(email);
    
    if (user) {
      throw new Error('Account exists but not linked to Google. Please link your Google account first or register with Google.');
    }

    return await this.createGoogleUser(googleUserData);
  }

  static async findByGoogleId(googleId) {
    const { pool } = require('../config/database');
    
    const query = `
      SELECT userID, username, email, password, fullName, profilePicture, 
             provider, providerID, providerEmail, role, loginStatus, 
             setupCompleted, setupSkipped, registerDate, createdAt, updatedAt
      FROM Users WHERE providerID = $1 AND provider = 'google'
    `;
    
    const result = await pool.query(query, [googleId]);
    
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

  static async updateUserWithGoogleInfo(userID, googleId, email, picture) {
    const { pool } = require('../config/database');
    
    const query = `
      UPDATE Users 
      SET provider = 'google', 
          providerID = $1, 
          providerEmail = $2, 
          profilePicture = $3,
          updatedAt = CURRENT_TIMESTAMP
      WHERE userID = $4
    `;
    
    await pool.query(query, [googleId, email, picture, userID]);
  }

  static async createGoogleUser(googleUserData) {
    const { googleId, email, name, picture } = googleUserData;
    
    const username = email.split('@')[0] + '_' + Date.now();
    
    const { pool } = require('../config/database');
    
    const query = `
      INSERT INTO Users (username, email, fullName, profilePicture, provider, providerID, providerEmail, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING userID, username, email, fullName, provider, role, registerDate, createdAt
    `;
    
    const values = [username, email, name, picture, 'google', googleId, email, 'customer'];
    const result = await pool.query(query, values);
    
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
    
    return new (require('../models/User'))(normalizedData);
  }

  static async handleGoogleLogin(googleToken, deviceInfo, ipAddress, userAgent) {
    const googleUserData = await this.verifyGoogleToken(googleToken);
    
    if (!googleUserData) {
      throw new Error('Invalid Google token');
    }

    const user = await this.findOrCreateGoogleUser(googleUserData);
    
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
