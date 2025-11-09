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

  /**
   * Update cover image URL for a processing
   * @param {string} processingID - Processing ID
   * @param {string} coverImageUrl - Cover image URL (from MinIO)
   * @param {string|null} userId - User ID (optional, for tracking who updated)
   * @returns {Promise<Object>} Updated processing data
   */
  static async updateCoverImage(processingID, coverImageUrl, userId = null) {
    try {
      if (!processingID || processingID === 'undefined') {
        throw new Error('processingID is required');
      }

      const updateQuery = `
        UPDATE songaiprocessing 
        SET coverimage = $1, updatedby = $2, updatedat = CURRENT_TIMESTAMP
        WHERE processingid = $3
        RETURNING *
      `;
      
      const result = await DatabaseService.query(updateQuery, [
        coverImageUrl || null,
        userId,
        processingID
      ]);

      if (!result.rows || result.rows.length === 0) {
        throw new Error('Processing not found');
      }

      const updated = result.rows[0];
      
      return {
        processingID: updated.processingid,
        coverImage: updated.coverimage || null
      };
    } catch (error) {
      logger.error('Error in ProcessingService.updateCoverImage:', error);
      throw error;
    }
  }

  static async updateSyncSettings(processingID, syncConfirmed, songStartTime = null, userId = null) {
    try {
      if (!processingID || processingID === 'undefined') {
        throw new Error('processingID is required');
      }

      if (typeof syncConfirmed !== 'boolean') {
        throw new Error('syncConfirmed must be a boolean');
      }

      if (songStartTime !== null && (typeof songStartTime !== 'number' || isNaN(songStartTime))) {
        throw new Error('songStartTime must be a number or null');
      }

      const updateQuery = `
        UPDATE songaiprocessing 
        SET syncconfirmed = $1, songstarttime = $2, updatedby = $3, updatedat = CURRENT_TIMESTAMP
        WHERE processingid = $4
        RETURNING *
      `;
      
      const result = await DatabaseService.query(updateQuery, [
        syncConfirmed,
        songStartTime,
        userId,
        processingID
      ]);

      if (!result.rows || result.rows.length === 0) {
        throw new Error('Processing not found');
      }

      const updated = result.rows[0];
      
      return {
        processingID: updated.processingid,
        syncConfirmed: updated.syncconfirmed || false,
        songStartTime: updated.songstarttime ? parseFloat(updated.songstarttime) : null
      };
    } catch (error) {
      logger.error('Error in ProcessingService.updateSyncSettings:', error);
      throw error;
    }
  }
}

module.exports = ProcessingService;

