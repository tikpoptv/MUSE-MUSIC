const swaggerJsdoc = require('swagger-jsdoc');
const { config } = require('./env');

// Import schemas
const commonSchemas = require('../docs/schemas/common');
const userSchemas = require('../docs/schemas/user');
const authSchemas = require('../docs/schemas/auth');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MUSE Music API',
      version: '1.0.0',
      description: 'API documentation for MUSE Music application'
    },
    servers: [
      {
        url: config.server.isProduction 
          ? `https://${process.env.BACKEND_HOST || 'api.musemusic.com'}`
          : `http://localhost:${config.server.port}`,
        description: config.server.isProduction ? 'Production server' : 'Development server'
      }
    ],
    components: {
      schemas: {
        ...commonSchemas,
        ...userSchemas,
        ...authSchemas
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/docs/paths/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
