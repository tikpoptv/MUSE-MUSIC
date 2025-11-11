const DatabaseService = require('./databaseService');
const { logger } = require('../middleware/logger');
const { config } = require('../config/env');
const crypto = require('crypto');

class ShareService {
  static generateShortLink(processingID) {
    const hash = crypto.createHash('sha256').update(processingID).digest('hex');
    const shortCode = hash.substring(0, 12);
    return shortCode;
  }

  static async createShareLink(processingID, userId = null) {
    try {
      if (!processingID) {
        throw new Error('processingID is required');
      }

      const checkQuery = `
        SELECT processingid, shortlink, sharestatus
        FROM songaiprocessing
        WHERE processingid = $1
      `;
      const checkResult = await DatabaseService.query(checkQuery, [processingID]);

      if (!checkResult.rows || checkResult.rows.length === 0) {
        throw new Error('Processing record not found');
      }

      const processing = checkResult.rows[0];

      if (processing.shortlink) {
        return {
          processingID: processing.processingid,
          shortLink: processing.shortlink,
          shareUrl: `${config.frontend.url}/share/${processing.shortlink}`,
          alreadyExists: true
        };
      }

      let shortLink = this.generateShortLink(processing.processingid);
      
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        const existingQuery = `
          SELECT processingid FROM songaiprocessing WHERE shortlink = $1
        `;
        const existingResult = await DatabaseService.query(existingQuery, [shortLink]);
        
        if (!existingResult.rows || existingResult.rows.length === 0) {
          break;
        }
        
        shortLink = this.generateShortLink(processing.processingid + Date.now() + attempts);
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique short link after multiple attempts');
      }

      const updateQuery = `
        UPDATE songaiprocessing
        SET shortlink = $1, updatedby = $2, updatedat = CURRENT_TIMESTAMP
        WHERE processingid = $3
        RETURNING processingid, shortlink
      `;
      const updateResult = await DatabaseService.query(updateQuery, [shortLink, userId, processingID]);

      if (!updateResult.rows || updateResult.rows.length === 0) {
        throw new Error('Failed to update processing record with short link');
      }

      logger.info('Share link created', { processingID, shortLink, userId });

      return {
        processingID: updateResult.rows[0].processingid,
        shortLink: updateResult.rows[0].shortlink,
        shareUrl: `${config.frontend.url}/share/${updateResult.rows[0].shortlink}`,
        alreadyExists: false
      };
    } catch (error) {
      logger.error('Error in ShareService.createShareLink:', error);
      throw error;
    }
  }

  static async getProcessingByShortLink(shortLink) {
    try {
      if (!shortLink) {
        throw new Error('shortLink is required');
      }

      const query = `
        SELECT
          p.processingid,
          p.songid,
          p.coverimage,
          p.summary,
          s.songname,
          s.artistname
        FROM songaiprocessing p
        LEFT JOIN songs s ON p.songid = s.songid
        WHERE p.shortlink = $1
        AND p.sharestatus = 'public_approved'
        AND p.approvalstatus = 'approved'
        LIMIT 1
      `;

      const result = await DatabaseService.query(query, [shortLink]);

      if (!result.rows || result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      return {
        processingID: row.processingid,
        songID: row.songid,
        coverImage: row.coverimage,
        summary: row.summary,
        songName: row.songname,
        artistName: row.artistname
      };
    } catch (error) {
      logger.error('Error in ShareService.getProcessingByShortLink:', error);
      throw error;
    }
  }
}

module.exports = ShareService;

