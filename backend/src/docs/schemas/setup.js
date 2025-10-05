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
                description: 'Birthday setup completion',
                example: true
              },
              step3: {
                type: 'boolean',
                description: 'Country, timezone, language setup completion',
                example: false
              },
              step4: {
                type: 'boolean',
                description: 'Music genres setup completion',
                example: false
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
          }
        }
      }
    }
  }
};
