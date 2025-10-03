const userSchemas = {
  User: {
    type: 'object',
    properties: {
      userID: {
        type: 'string',
        example: 'user_123456789'
      },
      username: {
        type: 'string',
        example: 'johndoe'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'john@example.com'
      },
      fullName: {
        type: 'string',
        example: 'John Doe'
      },
      role: {
        type: 'string',
        example: 'user'
      },
      loginStatus: {
        type: 'string',
        enum: ['online', 'offline'],
        example: 'online'
      },
      createdAt: {
        type: 'string',
        format: 'date-time'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time'
      }
    }
  },
  
  UserRegistration: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 20,
        example: 'johndoe'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'john@example.com'
      },
      password: {
        type: 'string',
        minLength: 6,
        example: 'password123'
      },
      fullName: {
        type: 'string',
        example: 'John Doe'
      }
    }
  },
  
  UserLogin: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: {
        type: 'string',
        example: 'johndoe'
      },
      password: {
        type: 'string',
        example: 'password123'
      }
    }
  },
  
  Session: {
    type: 'object',
    properties: {
      sessionID: {
        type: 'string',
        example: 'session_123456789'
      },
      expiresAt: {
        type: 'string',
        format: 'date-time'
      },
      deviceInfo: {
        type: 'string',
        example: 'mobile'
      },
      ipAddress: {
        type: 'string',
        example: '192.168.1.1'
      },
      userAgent: {
        type: 'string',
        example: 'Mozilla/5.0...'
      },
      isActive: {
        type: 'boolean',
        example: true
      },
      createdAt: {
        type: 'string',
        format: 'date-time'
      }
    }
  },
  
  Tokens: {
    type: 'object',
    properties: {
      accessToken: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      refreshToken: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      tokenType: {
        type: 'string',
        example: 'Bearer'
      },
      expiresIn: {
        type: 'string',
        example: '7d'
      }
    }
  }
};

module.exports = userSchemas;
