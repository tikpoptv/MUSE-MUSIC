const UserService = require('../services/userService');
const SessionService = require('../services/sessionService');
const JWTService = require('../services/jwtService');
const GoogleAuthService = require('../services/googleAuthService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');

const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !password) {
      return res.status(400).json(
        errorResponse('Please provide all required fields', 400)
      );
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json(
        errorResponse('Username must be 3-20 characters', 400)
      );
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json(
          errorResponse('Invalid email format', 400)
        );
      }
    }

    if (password.length < 6) {
      return res.status(400).json(
        errorResponse('Password must be at least 6 characters', 400)
      );
    }

    const usernameExists = await UserService.checkUsernameExists(username);
    if (usernameExists) {
      return res.status(409).json(
        errorResponse('Username already exists', 409)
      );
    }

    if (email) {
      const emailExists = await UserService.checkEmailExists(email);
      if (emailExists) {
        return res.status(409).json(
          errorResponse('Email already exists', 409)
        );
      }
    }

    const newUser = await UserService.createUser({
      username,
      email,
      password,
      fullName
    });

    res.status(201).json(
      successResponse('User registered successfully', newUser.toJSON())
    );

  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json(
        errorResponse('Please provide username and password', 400)
      );
    }

    const user = await UserService.authenticateUser(username, password);

    if (!user) {
      return res.status(401).json(
        errorResponse('Invalid username or password', 401)
      );
    }

    await UserService.updateLoginStatus(user.userID, 'online');

    const deviceInfo = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const session = await SessionService.createSession(
      user.userID,
      deviceInfo,
      ipAddress,
      userAgent
    );

    logger.info('Session created:', session);

    const accessToken = JWTService.generateAccessToken(user.userID, user.username, user.role);
    const refreshToken = JWTService.generateRefreshToken(user.userID);

    const responseData = {
      user: user.toJSON(),
      session: {
        sessionID: session.sessionid,
        expiresAt: session.expiresat,
        deviceInfo: session.deviceinfo,
        ipAddress: session.ipaddress,
        userAgent: session.useragent,
        isActive: session.isactive,
        createdAt: session.createdat
      },
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: '7d'
      }
    };

    res.status(200).json(
      successResponse('Login successful', responseData)
    );

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

const googleLogin = async (req, res) => {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json(
        errorResponse('Google token is required', 400)
      );
    }

    const deviceInfo = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await GoogleAuthService.handleGoogleLogin(
      googleToken,
      deviceInfo,
      ipAddress,
      userAgent
    );

    const responseData = {
      user: result.user.toJSON(),
      session: {
        sessionID: result.session.sessionid,
        expiresAt: result.session.expiresat,
        deviceInfo: result.session.deviceinfo,
        ipAddress: result.session.ipaddress,
        userAgent: result.session.useragent,
        isActive: result.session.isactive,
        createdAt: result.session.createdat
      },
      tokens: result.tokens
    };

    res.status(200).json(
      successResponse('Google login successful', responseData)
    );

  } catch (error) {
    res.status(500).json(
      errorResponse('Google authentication failed', 500)
    );
  }
};

    const googleCallback = async (req, res) => {
      try {
        const { code } = req.body;

        if (!code) {
          return res.status(400).json(
            errorResponse('Authorization code is required', 400)
          );
        }

        const { config } = require('../config/env');
        const redirectUri = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback`;
        
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: config.google.clientId,
            client_secret: config.google.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(`Failed to exchange code for token: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        const { id_token } = tokenData;

        const GoogleAuthService = require('../services/googleAuthService');
        const result = await GoogleAuthService.handleGoogleLogin(
          id_token,
          req.headers['user-agent'] || 'Unknown',
          req.ip || '127.0.0.1',
          req.headers['user-agent'] || 'Unknown'
        );

        res.json(successResponse('Google authentication successful', result));
      } catch (error) {
        if (error.message.includes('Account exists but not linked to Google')) {
          return res.status(409).json(
            errorResponse('Account exists but not linked to Google. Please link your Google account first or register with Google.', 409)
          );
        }
        
        res.status(500).json(
          errorResponse('Google authentication failed', 500)
        );
      }
    };

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json(
        errorResponse('Refresh token is required', 400)
      );
    }

    const decoded = JWTService.verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json(
        errorResponse('Invalid or expired refresh token', 401)
      );
    }

    const user = await UserService.findByID(decoded.userID);

    if (!user) {
      return res.status(401).json(
        errorResponse('User not found', 401)
      );
    }

    // สร้าง access token ใหม่
    const newAccessToken = JWTService.generateAccessToken(user.userID, user.username, user.role);

    const responseData = {
      tokens: {
        accessToken: newAccessToken,
        tokenType: 'Bearer',
        expiresIn: '7d'
      }
    };

    res.status(200).json(
      successResponse('Token refreshed successfully', responseData)
    );

  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  googleCallback,
  refreshToken
};
