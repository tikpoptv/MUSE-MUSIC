const DatabaseService = require('./databaseService');
const { logger } = require('../middleware/logger');

class RatingService {
  static async submitRating(processingID, userID, rating, comment = null) {
    try {
      const processingQuery = `SELECT processingid FROM songaiprocessing WHERE processingid = $1 LIMIT 1`;
      const processingResult = await DatabaseService.query(processingQuery, [processingID]);
      
      if (!processingResult.rows || processingResult.rows.length === 0) {
        throw new Error('Processing not found');
      }

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      if (!userID) {
        throw new Error('User ID is required');
      }

      const existingQuery = `
        SELECT ratingid FROM aiprocessingratings 
        WHERE processingid = $1 AND userid = $2 
        LIMIT 1
      `;
      const existingResult = await DatabaseService.query(existingQuery, [processingID, userID]);
      
      if (existingResult.rows && existingResult.rows.length > 0) {
        const updateQuery = `
          UPDATE aiprocessingratings 
          SET rating = $1, comment = $2, feedback = $3, updatedat = CURRENT_TIMESTAMP
          WHERE processingid = $4 AND userid = $5
          RETURNING ratingid, processingid, userid, rating, comment, feedback, createdat, updatedat
        `;
        const updateResult = await DatabaseService.query(updateQuery, [
          rating,
          comment,
          comment,
          processingID,
          userID
        ]);
        
        logger.info('Rating updated', { processingID, userID, rating });
        return updateResult.rows[0];
      }

      const insertQuery = `
        INSERT INTO aiprocessingratings (processingid, userid, rating, comment, feedback)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING ratingid, processingid, userid, rating, comment, feedback, createdat, updatedat
      `;
      
      const insertResult = await DatabaseService.query(insertQuery, [
        processingID,
        userID,
        rating,
        comment,
        comment
      ]);
      
      logger.info('Rating submitted', { processingID, userID, rating });
      return insertResult.rows[0];
      
    } catch (error) {
      logger.error('Error in RatingService.submitRating:', error);
      throw error;
    }
  }

  static async getRatingStats(processingID) {
    try {
      const query = `
        SELECT 
          COUNT(*) as totalRatings,
          COALESCE(ROUND(AVG(rating::DECIMAL), 2), 0.00) as averageRating,
          COALESCE(ROUND(AVG(rating::DECIMAL))::INT, 0) as starCount
        FROM aiprocessingratings
        WHERE processingid = $1
      `;
      
      const result = await DatabaseService.query(query, [processingID]);
      
      return {
        totalRatings: parseInt(result.rows[0].totalratings) || 0,
        averageRating: parseFloat(result.rows[0].averagerating) || 0.00,
        starCount: parseInt(result.rows[0].starcount) || 0
      };
    } catch (error) {
      logger.error('Error in RatingService.getRatingStats:', error);
      throw error;
    }
  }

  static async getUserRating(processingID, userID) {
    try {
      const query = `
        SELECT ratingid, processingid, userid, rating, comment, feedback, createdat, updatedat
        FROM aiprocessingratings
        WHERE processingid = $1 AND userid = $2
        LIMIT 1
      `;
      
      const result = await DatabaseService.query(query, [processingID, userID]);
      
      if (!result.rows || result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error in RatingService.getUserRating:', error);
      throw error;
    }
  }
}

module.exports = RatingService;

