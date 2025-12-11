const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getHealth = async (req, res) => {
  const healthData = {
    status: 'OK',
    message: 'MUSE Music API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: false,
    externalApis: {
      configured: {},
      missing: []
    }
  };

  // Check database connection if DB_HOST is configured
  if (process.env.DB_HOST) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      healthData.database = true;
    } catch (error) {
      healthData.database = false;
      healthData.status = 'WARNING';
      healthData.message = 'API running but database connection failed';
    }
  }

  // Check required environment variables for external APIs
  const externalApiChecks = {
    jwt: {
      name: 'JWT Authentication',
      required: true,
      vars: ['JWT_SECRET'],
      affectedFeatures: ['User authentication', 'Session management', 'Protected routes']
    },
    googleOAuth: {
      name: 'Google OAuth',
      required: true,
      vars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
      affectedFeatures: ['Google login', 'Social authentication', 'User registration via Google']
    },
    youtube: {
      name: 'YouTube API',
      required: true,
      vars: ['YOUTUBE_API_KEY'],
      affectedFeatures: ['YouTube video search', 'Song discovery from YouTube', 'Video metadata retrieval']
    },
    minio: {
      name: 'MinIO Storage',
      required: true,
      vars: ['MINIO_ENDPOINT', 'MINIO_PORT', 'MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY'],
      affectedFeatures: ['Image upload', 'Cover image storage', 'Profile picture upload', 'File management']
    },
    n8n: {
      name: 'N8N Workflow',
      required: true,
      vars: ['N8N_WORKFLOW_URL', 'TRANSLATE_WEBHOOK'],
      affectedFeatures: ['AI translation', 'Lyrics translation', 'Mood analysis', 'Email notifications']
    },
    lrclib: {
      name: 'LRCLIB Lyrics',
      required: false,
      vars: [], // Has default value, always available
      affectedFeatures: ['Lyrics search', 'Song lyrics database']
    }
  };

  // Check each external API configuration
  for (const [key, config] of Object.entries(externalApiChecks)) {
    // Skip if no vars to check (like LRCLIB which has defaults)
    if (config.vars.length === 0) {
      healthData.externalApis.configured[key] = {
        name: config.name,
        status: 'configured',
        required: config.required,
        note: 'Using default configuration'
      };
      continue;
    }

    const missingVars = config.vars.filter(varName => {
      const value = process.env[varName];
      // Check if variable is missing or empty
      if (!value || value === '') return true;
      
      // Check for placeholder patterns
      const placeholderPatterns = [
        'your-google-client-id-here',
        'your-google-client-secret-here',
        'your-youtube-api-key-here',
        'your-n8n-api-key-here',
        'your-super-secret-jwt-key-here-change-this-in-production'
      ];
      
      if (placeholderPatterns.some(pattern => value === pattern)) return true;
      
      // Check for example.com (but allow localhost)
      if (value.includes('example.com') && !value.includes('localhost')) return true;
      
      // Special check for MINIO_PORT - should be a valid number
      if (varName === 'MINIO_PORT') {
        const port = parseInt(value);
        if (isNaN(port) || port < 1 || port > 65535) return true;
      }
      
      return false;
    });

    if (missingVars.length === 0) {
      healthData.externalApis.configured[key] = {
        name: config.name,
        status: 'configured',
        required: config.required,
        affectedFeatures: config.affectedFeatures || []
      };
    } else {
      healthData.externalApis.configured[key] = {
        name: config.name,
        status: 'missing',
        required: config.required,
        missingVariables: missingVars,
        affectedFeatures: config.affectedFeatures || []
      };

      healthData.externalApis.missing.push({
        service: config.name,
        missingVariables: missingVars,
        affectedFeatures: config.affectedFeatures || []
      });
    }
  }

  // Calculate summary
  const configuredCount = Object.values(healthData.externalApis.configured).filter(
    api => api.status === 'configured'
  ).length;
  const totalCount = Object.keys(externalApiChecks).length;
  const missingCount = healthData.externalApis.missing.length;

  healthData.externalApis.summary = {
    total: totalCount,
    configured: configuredCount,
    missing: missingCount,
    missingRequired: missingCount // All missing are required now
  };

  // Update status based on missing configurations (all are required)
  if (missingCount > 0) {
    healthData.status = 'WARNING';
    healthData.message = `API running but ${missingCount} required external API configuration(s) are missing. System will not function completely.`;
  } else {
    healthData.status = 'OK';
    healthData.message = 'MUSE Music API is running';
  }

  // Determine response status
  let statusCode = 200;
  if (!healthData.database) {
    statusCode = 503;
  } else if (healthData.status === 'WARNING') {
    statusCode = 200; // Still OK but with warnings
  }

  if (statusCode === 200) {
    res.status(statusCode).json(successResponse(healthData.message, healthData, statusCode));
  } else {
    res.status(statusCode).json(errorResponse(healthData.message, statusCode, healthData));
  }
};

module.exports = {
  getHealth
};
