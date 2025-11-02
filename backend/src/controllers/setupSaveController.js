const { pool } = require('../config/database');
const { logger } = require('../middleware/logger');
const { successResponse, errorResponse } = require('../utils/response');

const saveSetupStep = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { step, data } = req.body;

    if (!step || !data) {
      return res.status(400).json(
        errorResponse('Step and data are required', 400)
      );
    }

    let query;
    let values;

    switch (step) {
      case 'step1': {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(data.password, 12);
        
        query = `
          UPDATE Users 
          SET password = $1, updatedAt = CURRENT_TIMESTAMP
          WHERE userID = $2
        `;
        values = [hashedPassword, userId];
        break;
      }

      case 'step2':
        // 2FA step - no database save needed
        res.json(successResponse(`Step ${step} saved successfully`));
        return;

      case 'step3':
        query = `
          INSERT INTO Customers (userID, DOB, createdAt, updatedAt)
          VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (userID) 
          DO UPDATE SET DOB = $2, updatedAt = CURRENT_TIMESTAMP
        `;
        values = [userId, data.birthday];
        break;

      case 'step4':
        query = `
          INSERT INTO Customers (userID, country, timezone, preferredLanguage, createdAt, updatedAt)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (userID) 
          DO UPDATE SET 
            country = $2, 
            timezone = $3, 
            preferredLanguage = $4, 
            updatedAt = CURRENT_TIMESTAMP
        `;
        values = [userId, data.country, data.timezone, data.language];
        break;

      case 'step5':
        query = `
          INSERT INTO Customers (userID, musicInterestTypes, createdAt, updatedAt)
          VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (userID) 
          DO UPDATE SET 
            musicInterestTypes = $2, 
            updatedAt = CURRENT_TIMESTAMP
        `;
        values = [userId, data.genres];
        break;

      default:
        return res.status(400).json(
          errorResponse('Invalid step', 400)
        );
    }

    await pool.query(query, values);

    res.json(successResponse(`Step ${step} saved successfully`));

  } catch (error) {
    logger.error('Error saving setup step:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

const skipSetup = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { termsAccepted } = req.body;

    if (!termsAccepted) {
      return res.status(400).json(
        errorResponse('Terms and conditions must be accepted to skip setup', 400)
      );
    }

    const query = `
      UPDATE Users 
      SET setupSkipped = true, updatedAt = CURRENT_TIMESTAMP
      WHERE userID = $1
    `;

    await pool.query(query, [userId]);

    res.json(successResponse('Setup skipped successfully'));

  } catch (error) {
    logger.error('Error skipping setup:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

const completeSetup = async (req, res) => {
  try {
    const userId = req.user.userID;

    const query = `
      UPDATE Users 
      SET setupCompleted = true, updatedAt = CURRENT_TIMESTAMP
      WHERE userID = $1
    `;

    await pool.query(query, [userId]);

    res.json(successResponse('Setup completed successfully'));

  } catch (error) {
    logger.error('Error completing setup:', error);
    res.status(500).json(
      errorResponse('Internal server error', 500)
    );
  }
};

module.exports = {
  saveSetupStep,
  skipSetup,
  completeSetup
};
