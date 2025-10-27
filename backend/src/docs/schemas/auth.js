const authSchemas = {
  GoogleLogin: {
    type: 'object',
    required: ['googleToken'],
    properties: {
      googleToken: {
        type: 'string',
        description: 'Google ID token',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzI5Nz...'
      }
    }
  },
  
  GoogleCallback: {
    type: 'object',
    required: ['code'],
    properties: {
      code: {
        type: 'string',
        description: 'Authorization code from Google',
        example: '4/0AX4XfWh...'
      }
    }
  },
  
  RefreshToken: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: {
        type: 'string',
        description: 'Refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  },
  
  ForgotPassword: {
    type: 'object',
    required: ['email'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'User email address',
        example: 'user@example.com'
      }
    }
  },
  
  ForgotPasswordResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Password reset link sent to your email'
      },
      data: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          }
        }
      }
    }
  },
  
  ResetPassword: {
    type: 'object',
    required: ['token', 'password'],
    properties: {
      token: {
        type: 'string',
        description: 'Password reset token from email',
        example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0'
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 128,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?~`]).{8,128}$',
        description: 'New password must contain at least 8 characters, including uppercase, lowercase, number, and special character',
        example: 'MyNewSecure123!'
      }
    }
  },
  
  ResetPasswordResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Password reset successfully'
      },
      data: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          }
        }
      }
    }
  },
  
  ValidateResetToken: {
    type: 'object',
    required: ['token'],
    properties: {
      token: {
        type: 'string',
        description: 'Password reset token to validate',
        example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0'
      }
    }
  },
  
  ValidateResetTokenResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Reset token is valid'
      },
      data: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          username: {
            type: 'string',
            example: 'johndoe'
          }
        }
      }
    }
  },
  
  LoginResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Login successful'
      },
      data: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User'
          },
          session: {
            $ref: '#/components/schemas/Session'
          },
          tokens: {
            $ref: '#/components/schemas/Tokens'
          }
        }
      }
    }
  }
};

module.exports = authSchemas;
