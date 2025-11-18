const { pool } = require('../config/database');
const { logger } = require('../middleware/logger');

class FavoriteService {
  static async addFavorite(userID, processingID) {
    const client = await pool.connect();
    try {
      if (!userID || !processingID) {
        logger.warn('Cannot add favorite: missing userID or processingID', { userID, processingID });
        return null;
      }

      const processingQuery = `
        SELECT processingid, songid
        FROM SongAIProcessing
        WHERE processingid = $1
        LIMIT 1
      `;

      const processingResult = await client.query(processingQuery, [processingID]);

      if (processingResult.rows.length === 0) {
        logger.warn('Processing not found for favorite', { processingID });
        return null;
      }

      const processing = processingResult.rows[0];
      const songID = processing.songid;

      if (!songID) {
        logger.warn('Processing missing songID when adding favorite', { processingID });
        return null;
      }

      const checkQuery = `
        SELECT favoriteid
        FROM UserFavorites
        WHERE userid = $1 AND processingid = $2 AND favoritetype = 'song'
      `;

      const existing = await client.query(checkQuery, [userID, processingID]);

      if (existing.rows.length > 0) {
        logger.info('Processing already favorited', { userID, processingID });
        return {
          favoriteID: existing.rows[0].favoriteid,
          isNew: false
        };
      }

      const insertQuery = `
        INSERT INTO UserFavorites (userid, songid, processingid, favoritetype)
        VALUES ($1, $2, $3, 'song')
        RETURNING favoriteid, createdat
      `;

      const result = await client.query(insertQuery, [userID, songID, processingID]);

      logger.info('Favorite added', {
        favoriteID: result.rows[0].favoriteid,
        userID,
        songID,
        processingID
      });

      return {
        favoriteID: result.rows[0].favoriteid,
        createdAt: result.rows[0].createdat,
        isNew: true
      };
    } catch (error) {
      logger.error('Error adding favorite:', error);
      return null;
    } finally {
      client.release();
    }
  }

  static async removeFavorite(userID, processingID) {
    const client = await pool.connect();
    try {
      if (!userID || !processingID) {
        logger.warn('Cannot remove favorite: missing userID or processingID', { userID, processingID });
        return false;
      }

      const deleteQuery = `
        DELETE FROM UserFavorites
        WHERE userid = $1 AND processingid = $2 AND favoritetype = 'song'
        RETURNING favoriteid
      `;

      const result = await client.query(deleteQuery, [userID, processingID]);

      if (result.rows.length > 0) {
        logger.info('Favorite removed', { userID, processingID });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error removing favorite:', error);
      return false;
    } finally {
      client.release();
    }
  }

  static async getUserFavorites(userID, page = 1, limit = 20) {
    const client = await pool.connect();
    try {
      if (!userID) {
        throw new Error('User ID is required');
      }

      const offset = (page - 1) * limit;

      const query = `
        SELECT 
          f.favoriteid,
          f.createdat,
          s.songid,
          s.songname,
          s.artistname,
          p.processingid,
          p.coverimage,
          p.originallanguage,
          p.targetlanguage
        FROM UserFavorites f
        INNER JOIN SongAIProcessing p ON f.processingid = p.processingid
        INNER JOIN Songs s ON p.songid = s.songid
        WHERE f.userid = $1 
          AND f.favoritetype = 'song'
          AND p.status = 'completed'
        ORDER BY f.createdat DESC
        LIMIT $2 OFFSET $3
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM UserFavorites
        WHERE userid = $1 AND favoritetype = 'song'
      `;

      const [result, countResult] = await Promise.all([
        client.query(query, [userID, limit, offset]),
        client.query(countQuery, [userID])
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      const favorites = result.rows.map(row => ({
        favoriteID: row.favoriteid,
        songID: row.songid,
        songName: row.songname,
        artistName: row.artistname,
        coverImage: row.coverimage,
        processingID: row.processingid,
        originalLanguage: row.originallanguage,
        targetLanguage: row.targetlanguage,
        createdAt: row.createdat
      }));

      return {
        favorites,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Error getting user favorites:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async isFavorite(userID, processingID) {
    const client = await pool.connect();
    try {
      if (!userID || !processingID) {
        return false;
      }

      const query = `
        SELECT favoriteid
        FROM UserFavorites
        WHERE userid = $1 AND processingid = $2 AND favoritetype = 'song'
        LIMIT 1
      `;

      const result = await client.query(query, [userID, processingID]);

      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error checking favorite:', error);
      return false;
    } finally {
      client.release();
    }
  }
}

module.exports = FavoriteService;

