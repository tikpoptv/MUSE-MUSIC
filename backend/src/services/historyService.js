const { pool } = require('../config/database');
const { logger } = require('../middleware/logger');

class HistoryService {
  static async recordViewHistory(userID, songID, processingID = null, deviceInfo = null) {
    const client = await pool.connect();
    try {
      if (!userID || !songID) {
        logger.warn('Cannot record view history: missing userID or songID', { userID, songID });
        return null;
      }

      const insertQuery = `
        INSERT INTO History (
          songid,
          userid,
          processingid,
          timestamp,
          playduration,
          playbackposition,
          deviceinfo,
          actiontype
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, NULL, NULL, $4, 'view')
        RETURNING historyid, timestamp
      `;

      const result = await client.query(insertQuery, [
        songID,
        userID,
        processingID,
        deviceInfo
      ]);

      logger.info('View history recorded', {
        historyID: result.rows[0].historyid,
        userID,
        songID,
        processingID
      });

      return {
        historyID: result.rows[0].historyid,
        timeStamp: result.rows[0].timestamp
      };
    } catch (error) {
      logger.error('Error recording view history:', error);
      return null;
    } finally {
      client.release();
    }
  }

  static async recordSaveTranslation(userID, songID, processingID, deviceInfo = null) {
    const client = await pool.connect();
    try {
      if (!userID || !songID || !processingID) {
        logger.warn('Cannot record save translation: missing userID, songID, or processingID', { userID, songID, processingID });
        return null;
      }

      const insertQuery = `
        INSERT INTO History (
          songid,
          userid,
          processingid,
          timestamp,
          playduration,
          playbackposition,
          deviceinfo,
          actiontype
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, NULL, NULL, $4, 'save')
        RETURNING historyid, timestamp
      `;

      const result = await client.query(insertQuery, [
        songID,
        userID,
        processingID,
        deviceInfo
      ]);

      logger.info('Save translation history recorded', {
        historyID: result.rows[0].historyid,
        userID,
        songID,
        processingID
      });

      return {
        historyID: result.rows[0].historyid,
        timeStamp: result.rows[0].timestamp
      };
    } catch (error) {
      logger.error('Error recording save translation history:', error);
      return null;
    } finally {
      client.release();
    }
  }

  static async getUserHistory(userID, page = 1, limit = 20, actionType = null) {
    const client = await pool.connect();
    try {
      if (!userID) {
        throw new Error('User ID is required');
      }

      const offset = (page - 1) * limit;
      const whereConditions = ['h.userid = $1'];
      const queryParams = [userID];
      let paramIndex = 2;

      if (actionType && (actionType === 'view' || actionType === 'save')) {
        whereConditions.push(`h.actiontype = $${paramIndex++}`);
        queryParams.push(actionType);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          h.historyid,
          h.songid,
          h.processingid,
          h.timestamp,
          h.deviceinfo,
          h.actiontype,
          s.songname,
          s.artistname,
          p.coverimage,
          p.translation,
          p.targetlanguage,
          p.originallanguage
        FROM History h
        INNER JOIN Songs s ON h.songid = s.songid
        LEFT JOIN SongAIProcessing p ON h.processingid = p.processingid
        ${whereClause}
        ORDER BY h.timestamp DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);

      const countQuery = `
        SELECT COUNT(*) as total
        FROM History h
        ${whereClause}
      `;

      const [result, countResult] = await Promise.all([
        client.query(query, queryParams),
        client.query(countQuery, queryParams.slice(0, -2))
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      const history = result.rows.map(row => ({
        historyID: row.historyid,
        songID: row.songid,
        processingID: row.processingid,
        timeStamp: row.timestamp,
        deviceInfo: row.deviceinfo,
        actionType: row.actiontype,
        song: {
          songID: row.songid,
          songName: row.songname,
          artistName: row.artistname,
          coverImage: row.coverimage
        },
        processing: row.processingid ? {
          processingID: row.processingid,
          translation: row.translation,
          targetLanguage: row.targetlanguage,
          originalLanguage: row.originallanguage
        } : null
      }));

      return {
        history,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Error getting user history:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = HistoryService;

