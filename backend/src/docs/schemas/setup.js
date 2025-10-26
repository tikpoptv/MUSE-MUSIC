module.exports = {
  SetupStatusResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      data: {
        type: 'object',
        properties: {
          allStatus: {
            type: 'boolean',
            description: 'Overall setup completion status',
            example: false
          },
          stepStatus: {
            type: 'object',
            properties: {
              step1: {
                type: 'boolean',
                description: 'Password setup completion (Google users only)',
                example: true
              },
              step2: {
                type: 'boolean',
                description: 'Two-Factor Authentication setup completion',
                example: true
              },
              step3: {
                type: 'boolean',
                description: 'Birthday setup completion',
                example: true
              },
              step4: {
                type: 'boolean',
                description: 'Country, timezone, language setup completion',
                example: false
              },
              step5: {
                type: 'boolean',
                description: 'Music genres setup completion',
                example: false
              }
            }
          },
          stepData: {
            type: 'object',
            description: 'User data for each step',
            properties: {
              step1: {
                type: 'object',
                properties: {
                  hasPassword: {
                    type: 'boolean',
                    example: true
                  }
                }
              },
              step2: {
                type: 'object',
                properties: {
                  twoFactorEnabled: {
                    type: 'boolean',
                    example: true
                  },
                  setupCompleted: {
                    type: 'boolean',
                    example: true
                  },
                  backupCodesCount: {
                    type: 'integer',
                    example: 10
                  }
                }
              },
              step3: {
                type: 'object',
                properties: {
                  birthday: {
                    type: 'string',
                    format: 'date',
                    example: '1995-06-15'
                  }
                }
              },
              step4: {
                type: 'object',
                properties: {
                  country: {
                    type: 'string',
                    example: 'Thailand'
                  },
                  timezone: {
                    type: 'string',
                    example: 'Asia/Bangkok'
                  },
                  language: {
                    type: 'string',
                    example: 'th'
                  }
                }
              },
              step5: {
                type: 'object',
                properties: {
                  genres: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    example: ['Pop', 'Rock', 'Jazz']
                  }
                }
              }
            }
          },
          setupCompleted: {
            type: 'boolean',
            description: 'Database setup_completed flag',
            example: false
          },
          setupSkipped: {
            type: 'boolean',
            description: 'Database setup_skipped flag',
            example: false
          },
          provider: {
            type: 'string',
            description: 'User authentication provider',
            example: 'google'
          },
          twoFAStatus: {
            type: 'object',
            description: 'Two-Factor Authentication status',
            nullable: true,
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
      }
    }
  },

  SetupSaveRequest: {
    type: 'object',
    required: ['step', 'data'],
    properties: {
      step: {
        type: 'string',
        enum: ['step1', 'step2', 'step3', 'step4', 'step5'],
        description: 'The setup step to save'
      },
      data: {
        type: 'object',
        description: 'The data to save for the step',
        properties: {
          password: {
            type: 'string',
            description: 'Password for step1 (Google users only)'
          },
          birthday: {
            type: 'string',
            format: 'date',
            description: 'Birthday for step3'
          },
          country: {
            type: 'string',
            description: 'Country for step4'
          },
          timezone: {
            type: 'string',
            description: 'Timezone for step4'
          },
          language: {
            type: 'string',
            description: 'Language for step4'
          },
          genres: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Music genres for step5'
          }
        }
      }
    }
  },

  SetupSaveResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Step step1 saved successfully'
      }
    }
  }
};
