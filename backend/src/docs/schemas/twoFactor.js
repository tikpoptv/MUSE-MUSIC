module.exports = {
  TwoFactorSetupRequest: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        description: 'Username for 2FA setup'
      }
    }
  },

  TwoFactorSetupResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: '2FA setup initiated'
      },
      data: {
        type: 'object',
        properties: {
          qrCode: {
            type: 'string',
            description: 'Base64 encoded QR code image',
            example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
          },
          manualEntryKey: {
            type: 'string',
            description: 'Manual entry key for authenticator apps',
            example: 'JBSWY3DPEHPK3PXP'
          }
        }
      }
    }
  },

  TwoFactorVerifyRequest: {
    type: 'object',
    required: ['token'],
    properties: {
      token: {
        type: 'string',
        description: '6-digit TOTP code or backup code',
        example: '123456',
        minLength: 6,
        maxLength: 8
      }
    }
  },

  TwoFactorVerifyResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Verification code is valid'
      },
      data: {
        type: 'object',
        properties: {
          verified: {
            type: 'boolean',
            example: true
          }
        }
      }
    }
  },

  TwoFactorBackupCodesResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Backup codes generated'
      },
      data: {
        type: 'object',
        properties: {
          backupCodes: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['A1B2C3D4', 'E5F6G7H8', 'I9J0K1L2', 'M3N4O5P6', 'Q7R8S9T0', 'U1V2W3X4', 'Y5Z6A7B8', 'C9D0E1F2', 'G3H4I5J6', 'K7L8M9N0']
          }
        }
      }
    }
  },

  TwoFactorStatusResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: '2FA status retrieved'
      },
      data: {
        type: 'object',
        properties: {
          twofactorenabled: {
            type: 'boolean',
            example: true
          },
          twoFactorSetupCompleted: {
            type: 'boolean',
            example: true
          },
          setupStep: {
            type: 'string',
            enum: ['not_started', 'qr_generated', 'verified', 'backup_codes_generated'],
            example: 'backup_codes_generated'
          },
          failedAttempts: {
            type: 'integer',
            example: 0
          },
          isLocked: {
            type: 'boolean',
            example: false
          },
          lockedUntil: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: null
          },
          backupCodesCount: {
            type: 'integer',
            example: 10
          }
        }
      }
    }
  },

  TwoFactorDisableResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: '2FA disabled successfully'
      },
      data: {
        type: 'object',
        properties: {
          disabled: {
            type: 'boolean',
            example: true
          }
        }
      }
    }
  },

  LoginWith2FARequest: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: {
        type: 'string',
        description: 'Username or email',
        example: 'john_doe'
      },
      password: {
        type: 'string',
        description: 'User password',
        example: 'password123'
      },
      twoFactorToken: {
        type: 'string',
        description: '6-digit TOTP code or backup code (required if 2FA is enabled)',
        example: '123456'
      }
    }
  },

  LoginWith2FAResponse: {
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
            $ref: '#/components/schemas/AuthTokens'
          }
        }
      }
    }
  },

  TwoFARequiredResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: '2FA verification required'
      },
      data: {
        type: 'object',
        properties: {
          requires2FA: {
            type: 'boolean',
            example: true
          },
          userID: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          message: {
            type: 'string',
            example: 'Please provide 2FA verification code'
          }
        }
      }
    }
  },

  TwoFactorErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        example: 'Invalid 2FA verification code'
      },
      error: {
        type: 'string',
        example: 'INVALID_2FA_CODE'
      }
    }
  },

  TwoFactorLockedResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        example: 'Account temporarily locked due to too many failed attempts'
      },
      error: {
        type: 'string',
        example: 'ACCOUNT_LOCKED'
      }
    }
  }
};
