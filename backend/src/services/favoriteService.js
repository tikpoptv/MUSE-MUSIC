const { pool } = require('../config/database');
const { logger } = require('../middleware/logger');

class FavoriteService {
  static async addFavorite(userID, songID) {
    const client = await pool.connect();
    try {
      if (!userID || !songID) {
        logger.warn('Cannot add favorite: missing userID or songID', { userID, songID });
        return null;
      }

      const checkQuery = `
        SELECT favoriteid
        FROM UserFavorites
        WHERE userid = $1 AND songid = $2 AND favoritetype = 'song'
      `;

      const existing = await client.query(checkQuery, [userID, songID]);

      if (existing.rows.length > 0) {
        logger.info('Song already favorited', { userID, songID });
        return {
          favoriteID: existing.rows[0].favoriteid,
          isNew: false
        };
      }

      const insertQuery = `
        INSERT INTO UserFavorites (userid, songid, favoritetype)
        VALUES ($1, $2, 'song')
        RETURNING favoriteid, createdat
      `;

      const result = await client.query(insertQuery, [userID, songID]);

      logger.info('Favorite added', {
        favoriteID: result.rows[0].favoriteid,
        userID,
        songID
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

  static async removeFavorite(userID, songID) {
    const client = await pool.connect();
    try {
      if (!userID || !songID) {
        logger.warn('Cannot remove favorite: missing userID or songID', { userID, songID });
        return false;
      }

      const deleteQuery = `
        DELETE FROM UserFavorites
        WHERE userid = $1 AND songid = $2 AND favoritetype = 'song'
        RETURNING favoriteid
      `;

      const result = await client.query(deleteQuery, [userID, songID]);

      if (result.rows.length > 0) {
        logger.info('Favorite removed', { userID, songID });
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
          f.songid,
          f.createdat,
          s.songname,
          s.artistname,
          p.coverimage,
          p.processingid,
          p.originallanguage,
          p.targetlanguage
        FROM UserFavorites f
        INNER JOIN Songs s ON f.songid = s.songid
        LEFT JOIN LATERAL (
          SELECT 
            p1.processingid,
            p1.coverimage,
            p1.originallanguage,
            p1.targetlanguage
          FROM SongAIProcessing p1
          WHERE p1.songid = f.songid
            AND p1.status = 'completed'
            AND p1.approvalstatus = 'approved'
            AND p1.sharestatus = 'public_approved'
          ORDER BY 
            CASE WHEN p1.totalratings > 0 THEN 0 ELSE 1 END,
            p1.totalratings DESC,
            p1.averagerating DESC NULLS LAST,
            p1.createdat DESC
          LIMIT 1
        ) p ON true
        WHERE f.userid = $1 AND f.favoritetype = 'song'
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

  static async isFavorite(userID, songID) {
    const client = await pool.connect();
    try {
      if (!userID || !songID) {
        return false;
      }

      const query = `
        SELECT favoriteid
        FROM UserFavorites
        WHERE userid = $1 AND songid = $2 AND favoritetype = 'song'
        LIMIT 1
      `;

      const result = await client.query(query, [userID, songID]);

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

