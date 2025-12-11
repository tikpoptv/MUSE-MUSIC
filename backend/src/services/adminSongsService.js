const { pool } = require('../config/database');
const { logger } = require('../middleware/logger');
const AnalysisService = require('./analysisService');

class AdminSongsService {
  static async getPendingSongs(page = 1, limit = 10, search = '', statusFilter = 'all') {
    const client = await pool.connect();
    try {
      const offset = (page - 1) * limit;
      
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      // Status filtering (use actual lowercase columns)
      if (statusFilter && statusFilter !== 'all') {
        switch (statusFilter) {
          case 'not_approve':
          case 'pending':
            whereConditions.push(`(p.approvalstatus = 'pending' OR p.sharestatus = 'public_pending')`);
            break;
          case 'done':
          case 'approved':
            whereConditions.push(`p.approvalstatus = 'approved'`);
            break;
          case 'rejected':
            whereConditions.push(`p.approvalstatus = 'rejected'`);
            break;
          case 'private':
            whereConditions.push(`p.sharestatus = 'private'`);
            break;
          case 'public_pending':
            whereConditions.push(`p.sharestatus = 'public_pending'`);
            break;
          case 'public_approved':
            whereConditions.push(`p.sharestatus = 'public_approved'`);
            break;
          default:
            break;
        }
      }

      if (search && search.trim() !== '') {
        whereConditions.push(`(
          s.songname ILIKE $${paramIndex} OR 
          s.artistname ILIKE $${paramIndex} OR
          p.originallanguage ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${search.trim()}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const countQuery = `
        SELECT COUNT(DISTINCT p.processingid) as total
        FROM songaiprocessing p
        INNER JOIN songs s ON p.songid = s.songid
        LEFT JOIN users u ON p.createdby = u.userid
        ${whereClause}
      `;

      const dataQuery = `
        SELECT 
          p.processingid,
          p.songid,
          p.sharestatus,
          p.approvalstatus,
          p.createdat,
          p.updatedat,
          p.coverimage,
          s.songname,
          s.artistname,
          s.genre,
          s.duration,
          p.originallanguage,
          p.targetlanguage,
          u.username as created_by_username,
          u.email as created_by_email,
          u.fullname as created_by_fullname,
          u.profilepicture as created_by_avatar
        FROM songaiprocessing p
        INNER JOIN songs s ON p.songid = s.songid
        LEFT JOIN users u ON p.createdby = u.userid
        ${whereClause}
        ORDER BY p.createdat DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);
      const countParams = queryParams.slice(0, paramIndex - 1);
      const [countResult, dataResult] = await Promise.all([
        client.query(countQuery, countParams),
        client.query(dataQuery, queryParams)
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      const songsRaw = dataResult.rows;
      
      // Only return essential data for table display
      // Full details (including lyrics) should be fetched via detail API when needed
      const songsResolved = songsRaw.map((row) => {
        let status = 'Unknown';
        let highlight = false;
        
        if (row.approvalstatus === 'rejected') {
          status = 'Rejected';
          highlight = false;
        } else if (row.approvalstatus === 'pending' || row.sharestatus === 'public_pending') {
          status = 'Not Approve';
          highlight = true;
        } else if (row.approvalstatus === 'approved') {
          if (row.sharestatus === 'public_approved') {
            status = 'Done';
            highlight = false;
          } else if (row.sharestatus === 'private') {
            status = 'Approved (Private)';
            highlight = false;
          } else {
            status = 'Approved';
            highlight = false;
          }
        } else {
          status = 'Pending';
          highlight = true;
        }

        return {
          processingID: row.processingid,
          songID: row.songid,
          songName: row.songname || '',
          songNameEnglish: row.songname || '',
          artistName: row.artistname || '',
          genre: row.genre || '',
          duration: row.duration || 0,
          language: row.originallanguage || 'Unknown',
          targetLanguage: row.targetlanguage || '',
          status: status,
          shareStatus: row.sharestatus,
          approvalStatus: row.approvalstatus,
          createdAt: row.createdat,
          updatedAt: row.updatedat,
          coverImage: row.coverimage,
          createdBy: row.created_by_username || row.created_by_email || 'Unknown',
          createdByUsername: row.created_by_username || row.created_by_email || 'Unknown',
          createdByAvatar: row.created_by_avatar,
          code: row.originallanguage ? row.originallanguage.substring(0, 2).toUpperCase() : 'CN',
          highlight: highlight
        };
      });

      return {
        songs: songsResolved,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Error in getPendingSongs:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getPendingCount() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM songaiprocessing 
        WHERE (approvalstatus = 'pending' OR sharestatus = 'public_pending')
      `;
      
      const result = await client.query(query);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('Error in getPendingCount:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async approveSong(processingID, userID, note = null) {
    const client = await pool.connect();
    try {
      const query = `
        UPDATE songaiprocessing
        SET 
          approvalstatus = 'approved',
          sharestatus = 'public_approved',
          approvedby = $1,
          approvedat = CURRENT_TIMESTAMP,
          approvalnote = $2,
          ispublic = TRUE,
          updatedat = CURRENT_TIMESTAMP,
          updatedby = $1
        WHERE processingid = $3
        RETURNING *
      `;

      const result = await client.query(query, [userID, note, processingID]);
      
      if (result.rows.length === 0) {
        throw new Error('Processing not found');
      }

      return {
        processingID: result.rows[0].processingid,
        songID: result.rows[0].songid,
        approvalStatus: result.rows[0].approvalstatus,
        shareStatus: result.rows[0].sharestatus,
        approvedAt: result.rows[0].approvedat
      };
    } catch (error) {
      logger.error('Error in approveSong:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async rejectSong(processingID, userID, note = null) {
    const client = await pool.connect();
    try {
      const query = `
        UPDATE songaiprocessing
        SET 
          approvalstatus = 'rejected',
          sharestatus = 'private',
          approvedby = $1,
          approvedat = CURRENT_TIMESTAMP,
          approvalnote = $2,
          ispublic = FALSE,
          updatedat = CURRENT_TIMESTAMP,
          updatedby = $1
        WHERE processingid = $3
        RETURNING *
      `;

      const result = await client.query(query, [userID, note, processingID]);
      
      if (result.rows.length === 0) {
        throw new Error('Processing not found');
      }

      return {
        processingID: result.rows[0].processingid,
        songID: result.rows[0].songid,
        approvalStatus: result.rows[0].approvalstatus,
        shareStatus: result.rows[0].sharestatus,
        approvedAt: result.rows[0].approvedat
      };
    } catch (error) {
      logger.error('Error in rejectSong:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async bulkApprove(processingIDs, userID, note = null) {
    const client = await pool.connect();
    try {
      if (!Array.isArray(processingIDs) || processingIDs.length === 0) {
        throw new Error('Processing IDs array is required');
      }

      const placeholders = processingIDs.map((_, index) => `$${index + 2}`).join(', ');
      
      const query = `
        UPDATE songaiprocessing
        SET 
          approvalstatus = 'approved',
          sharestatus = 'public_approved',
          approvedby = $1,
          approvedat = CURRENT_TIMESTAMP,
          approvalnote = $2,
          ispublic = TRUE,
          updatedat = CURRENT_TIMESTAMP,
          updatedby = $1
        WHERE processingid IN (${placeholders})
        RETURNING processingid, songid
      `;

      const result = await client.query(query, [userID, note, ...processingIDs]);
      
      return {
        approved: result.rows.length,
        processingIDs: result.rows.map(row => row.processingid)
      };
    } catch (error) {
      logger.error('Error in bulkApprove:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async bulkReject(processingIDs, userID, note = null) {
    const client = await pool.connect();
    try {
      if (!Array.isArray(processingIDs) || processingIDs.length === 0) {
        throw new Error('Processing IDs array is required');
      }

      const placeholders = processingIDs.map((_, index) => `$${index + 2}`).join(', ');
      
      const query = `
        UPDATE songaiprocessing
        SET 
          approvalstatus = 'rejected',
          sharestatus = 'private',
          approvedby = $1,
          approvedat = CURRENT_TIMESTAMP,
          approvalnote = $2,
          ispublic = FALSE,
          updatedat = CURRENT_TIMESTAMP,
          updatedby = $1
        WHERE processingid IN (${placeholders})
        RETURNING processingid, songid
      `;

      const result = await client.query(query, [userID, note, ...processingIDs]);
      
      return {
        rejected: result.rows.length,
        processingIDs: result.rows.map(row => row.processingid)
      };
    } catch (error) {
      logger.error('Error in bulkReject:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateSongLyrics(processingID, lyrics, userID, isAdmin = false) {
    const client = await pool.connect();
    try {
      if (!processingID) {
        throw new Error('Processing ID is required');
      }

      if (!lyrics || typeof lyrics !== 'string') {
        throw new Error('Lyrics must be a non-empty string');
      }

      const checkQuery = `
        SELECT p.processingid, p.songid, p.translation, p.approvalstatus, p.sharestatus, s.lyrics as original_lyrics
        FROM songaiprocessing p
        INNER JOIN songs s ON p.songid = s.songid
        WHERE p.processingid = $1
      `;
      const checkResult = await client.query(checkQuery, [processingID]);

      if (checkResult.rows.length === 0) {
        throw new Error('Processing record not found');
      }

      const processing = checkResult.rows[0];
      const isApproved = processing.approvalstatus === 'approved' && processing.sharestatus === 'public_approved';

      // Add rule: Song must not be approved, or user must be admin
      if (isApproved && !isAdmin) {
        throw new Error('Cannot edit lyrics: This processing has been approved. Only admin can edit approved songs.');
      }

      logger.info('Received lyrics to update:', {
        processingID,
        lyricsLength: lyrics.length,
        lyricsPreview: lyrics.substring(0, 200)
      });

      // Frontend is responsible for validating lyrics structure; proceed to mapping

      const mappedTranslation = AnalysisService.mapTranslationToPreview(lyrics);

      logger.info('Mapped translation to preview:', {
        processingID,
        mappedLength: mappedTranslation.length,
        mappedPreview: mappedTranslation.substring(0, 200)
      });

      const updateQuery = `
        UPDATE songaiprocessing
        SET 
          translation = $1,
          updatedat = CURRENT_TIMESTAMP,
          updatedby = $2
        WHERE processingid = $3
        RETURNING processingid, translation, updatedat
      `;

      const result = await client.query(updateQuery, [mappedTranslation, userID, processingID]);

      if (result.rows.length === 0) {
        throw new Error('Failed to update lyrics');
      }

      return {
        processingID: result.rows[0].processingid,
        translation: result.rows[0].translation,
        updatedAt: result.rows[0].updatedat
      };
    } catch (error) {
      logger.error('Error in updateSongLyrics:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = AdminSongsService;

