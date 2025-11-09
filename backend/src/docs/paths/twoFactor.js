module.exports = {
  '/api/2fa/setup': {
    post: {
      tags: ['Two-Factor Authentication'],
      summary: 'Setup 2FA for user',
      description: 'Generate QR code and secret key for 2FA setup',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: '2FA setup initiated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TwoFactorSetupResponse'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },

  '/api/2fa/verify-setup': {
    post: {
      tags: ['Two-Factor Authentication'],
      summary: 'Verify 2FA setup code',
      description: 'Verify the TOTP code during 2FA setup process',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/TwoFactorVerifyRequest'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Setup code verified successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TwoFactorVerifyResponse'
              }
            }
          }
        },
        400: {
          description: 'Invalid verification code',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TwoFactorErrorResponse'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },

  '/api/2fa/generate-backup-codes': {
    post: {
      tags: ['Two-Factor Authentication'],
      summary: 'Generate backup codes',
      description: 'Generate 10 backup codes for 2FA recovery',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Backup codes generated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TwoFactorBackupCodesResponse'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },

  '/api/2fa/verify': {
    post: {
      tags: ['Two-Factor Authentication'],
      summary: 'Verify 2FA code',
      description: 'Verify TOTP code or backup code for 2FA authentication',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/TwoFactorVerifyRequest'
            }
          }
        }
      },
      responses: {
        200: {
          description: '2FA verification successful',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TwoFactorVerifyResponse'
              }
            }
          }
        },
        400: {
          description: 'Invalid verification code',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TwoFactorErrorResponse'
              }
            }
          }
        },
        423: {
          description: 'Account locked due to too many failed attempts',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TwoFactorLockedResponse'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },

  '/api/2fa/disable': {
    post: {
      tags: ['Two-Factor Authentication'],
      summary: 'Disable 2FA',
      description: 'Disable 2FA for the authenticated user',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: '2FA disabled successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TwoFactorDisableResponse'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },

  '/api/2fa/status': {
    get: {
      tags: ['Two-Factor Authentication'],
      summary: 'Get 2FA status',
      description: 'Get current 2FA status and configuration for the authenticated user',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: '2FA status retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TwoFactorStatusResponse'
              }
            }
          }
        },
        404: {
          description: '2FA status not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },

  '/api/2fa/backup-codes': {
    get: {
      tags: ['Two-Factor Authentication'],
      summary: 'Get backup codes',
      description: 'Retrieve current backup codes for the authenticated user',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Backup codes retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TwoFactorBackupCodesResponse'
              }
            }
          }
        },
        404: {
          description: 'Backup codes not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },

  '/api/2fa/regenerate-backup-codes': {
    post: {
      tags: ['Two-Factor Authentication'],
      summary: 'Regenerate backup codes',
      description: 'Generate new backup codes and invalidate old ones',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Backup codes regenerated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TwoFactorBackupCodesResponse'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  }
};
