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
  static async updateCoverImage(processingID, coverImageUrl, userId = null, isAdmin = false) {
    try {
      if (!processingID || processingID === 'undefined') {
        throw new Error('processingID is required');
      }

      // Check approval status before updating
      const checkQuery = `
        SELECT approvalstatus, sharestatus
        FROM songaiprocessing
        WHERE processingid = $1
      `;
      const checkResult = await DatabaseService.query(checkQuery, [processingID]);

      if (!checkResult.rows || checkResult.rows.length === 0) {
        throw new Error('Processing not found');
      }

      const processing = checkResult.rows[0];
      const isApproved = processing.approvalstatus === 'approved' && processing.sharestatus === 'public_approved';

      // Add rule: Song must not be approved, or user must be admin
      if (isApproved && !isAdmin) {
        throw new Error('Cannot edit cover image: This processing has been approved. Only admin can edit approved songs.');
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

  static async updateSyncSettings(processingID, syncConfirmed, songStartTime = null, userId = null, isAdmin = false) {
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

      // Check approval status before updating
      const checkQuery = `
        SELECT approvalstatus, sharestatus
        FROM songaiprocessing
        WHERE processingid = $1
      `;
      const checkResult = await DatabaseService.query(checkQuery, [processingID]);

      if (!checkResult.rows || checkResult.rows.length === 0) {
        throw new Error('Processing not found');
      }

      const processing = checkResult.rows[0];
      const isApproved = processing.approvalstatus === 'approved' && processing.sharestatus === 'public_approved';

      // Add rule: Song must not be approved, or user must be admin
      if (isApproved && !isAdmin) {
        throw new Error('Cannot edit sync settings: This processing has been approved. Only admin can edit approved songs.');
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

