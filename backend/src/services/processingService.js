const DatabaseService = require('./databaseService');
const { logger } = require('../middleware/logger');

class ProcessingService {
  /**
   * Update YouTube video ID for a processing
   * @param {string} processingID - Processing ID
   * @param {string} youtubeVideoId - YouTube video ID
   * @param {string|null} userId - User ID (optional, for tracking who updated)
   * @returns {Promise<Object>} Updated processing data
   */
  static async updateYouTubeVideoId(processingID, youtubeVideoId, userId = null) {
    try {
      if (!processingID || processingID === 'undefined') {
        throw new Error('processingID is required');
      }

      const updateQuery = `
        UPDATE songaiprocessing 
        SET youtubevideoid = $1, updatedby = $2, updatedat = CURRENT_TIMESTAMP
        WHERE processingid = $3
        RETURNING *
      `;
      
      const result = await DatabaseService.query(updateQuery, [
        youtubeVideoId || null,
        userId,
        processingID
      ]);

      if (!result.rows || result.rows.length === 0) {
        throw new Error('Processing not found');
      }

      const updated = result.rows[0];
      
      return {
        processingID: updated.processingid,
        youtubeVideoId: updated.youtubevideoid || null
      };
    } catch (error) {
      logger.error('Error in ProcessingService.updateYouTubeVideoId:', error);
      throw error;
    }
  }
}

module.exports = ProcessingService;

