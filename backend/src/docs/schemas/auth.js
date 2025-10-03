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
