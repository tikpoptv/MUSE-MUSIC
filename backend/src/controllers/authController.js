const UserService = require('../services/userService');
const SessionService = require('../services/sessionService');
const JWTService = require('../services/jwtService');
const GoogleAuthService = require('../services/googleAuthService');
const EmailService = require('../services/emailService');
const TwoFactorService = require('../services/twoFactorService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');
const { validatePassword } = require('../utils/passwordValidation');
const crypto = require('crypto');

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

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json(
        errorResponse('Password validation failed', 400, passwordValidation.errors)
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

    if (email) {
      try {
        await EmailService.sendWelcomeEmail({
          email,
          fullName,
          username
        });
        logger.info('Welcome email sent to:', email);
      } catch (emailError) {
        logger.error('Failed to send welcome email:', emailError);
      }
    }

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
    const { username, password, twoFactorToken } = req.body;

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

    const twoFAStatus = await TwoFactorService.get2FAStatus(user.userID);

    // Get device info once
    const deviceInfo = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    if (twoFAStatus && twoFAStatus.twofactorenabled) {
      if (!twoFactorToken) {
        return res.status(200).json(
          successResponse('2FA verification required', {
            requires2FA: true,
            userID: user.userID,
            message: 'Please provide 2FA verification code'
          })
        );
      }

      const isValid2FA = await TwoFactorService.verifyToken(
        user.userID,
        twoFactorToken,
        null,
        ipAddress,
        userAgent,
        deviceInfo
      );

      if (!isValid2FA) {
        return res.status(400).json(
          errorResponse('Invalid 2FA verification code', 400)
        );
      }
    }

    await UserService.updateLoginStatus(user.userID, 'online');

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
    if (error.message.includes('locked')) {
      res.status(423).json(
        errorResponse('Account temporarily locked due to too many failed attempts', 423)
      );
    } else {
      res.status(500).json(
        errorResponse('Internal server error', 500)
      );
    }
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
        const { code, type = 'login', userId } = req.body;

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
          req.headers['user-agent'] || 'Unknown',
          type,
          userId
        );

        res.json(successResponse('Google authentication successful', result));
      } catch (error) {
        logger.error('Google callback error:', error);
        
        if (error.message.includes('already linked to another user')) {
          res.status(409).json(
            errorResponse('This Google account is already linked to another user', 409)
          );
        } else {
          res.status(500).json(
            errorResponse('Google authentication failed', 500)
          );
        }
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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(
        errorResponse('Email is required', 400)
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json(
        errorResponse('Invalid email format', 400)
      );
    }

    const user = await UserService.findByEmail(email);
    if (!user) {
      return res.status(200).json(
        successResponse('If the email exists, a password reset link has been sent', { email })
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await UserService.storePasswordResetToken(user.userID, resetToken, resetTokenExpiry);

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    try {
      await EmailService.sendPasswordResetEmail({
        email: user.email,
        fullName: user.fullName || user.username,
        resetLink
      });
      
      logger.info('Password reset email sent successfully:', { email: user.email });
      
      return res.status(200).json(
        successResponse('Password reset link sent to your email', { email })
      );
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      return res.status(500).json(
        errorResponse('Failed to send password reset email', 500)
      );
    }

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json(
        errorResponse('Token and password are required', 400)
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json(
        errorResponse('Password validation failed', 400, passwordValidation.errors)
      );
    }

    // Find user by reset token
    const user = await UserService.findByResetToken(token);
    if (!user) {
      return res.status(400).json(
        errorResponse('Invalid or expired reset token', 400)
      );
    }

    // Check if token is expired
    if (user.passwordResetTokenExpiry && new Date() > new Date(user.passwordResetTokenExpiry)) {
      return res.status(400).json(
        errorResponse('Reset token has expired', 400)
      );
    }

    // Update password and clear reset token
    await UserService.updatePassword(user.userID, password);
    await UserService.clearPasswordResetToken(user.userID);

    logger.info('Password reset successfully for user:', { userID: user.userID, email: user.email });

    res.status(200).json(
      successResponse('Password reset successfully', { email: user.email })
    );

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json(
        errorResponse('Reset token is required', 400)
      );
    }

    // Find user by reset token
    const user = await UserService.findByResetToken(token);
    if (!user) {
      return res.status(400).json(
        errorResponse('Invalid reset token', 400)
      );
    }

    // Check if token is expired
    if (user.passwordResetTokenExpiry && new Date() > new Date(user.passwordResetTokenExpiry)) {
      return res.status(400).json(
        errorResponse('Reset token has expired', 400)
      );
    }

    res.status(200).json(
      successResponse('Reset token is valid', { 
        email: user.email,
        username: user.username 
      })
    );

  } catch (error) {
    logger.error('Validate reset token error:', error);
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
  refreshToken,
  forgotPassword,
  resetPassword,
  validateResetToken
};
