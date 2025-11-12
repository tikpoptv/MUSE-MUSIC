const DatabaseService = require('./databaseService');
const { logger } = require('../middleware/logger');
const RecommendHomeService = require('./recommendHomeService');

class ForYouService {
  static async getForYouContent(userID) {
    try {
      const moods = await this.getMoodStats(userID);
      const recentlySearched = await this.getRecentlySearched(userID, 4);
      const recommendations = await this.getRecommendations();
      const topHits = await this.getTopHits(5);

      return {
        moods,
        recentlySearched,
        recommendations,
        topHits
      };
    } catch (error) {
      logger.error('Error in ForYouService.getForYouContent:', error);
      throw error;
    }
  }

  static async getMoodStats(userID) {
    try {
      const query = `
        WITH user_moods AS (
          SELECT 
            p.moodtype,
            COUNT(*) as count
          FROM songaiprocessing p
          WHERE p.createdby = $1
            AND p.status = 'completed'
            AND p.moodtype IS NOT NULL
            AND p.moodtype != ''
          GROUP BY p.moodtype
        ),
        parsed_moods AS (
          SELECT 
            moodtype,
            count,
            CASE 
              WHEN moodtype LIKE '[%' THEN 
                jsonb_array_elements(moodtype::jsonb)->>'type'
              ELSE 
                moodtype
            END as mood_type
          FROM user_moods
        )
        SELECT 
          mood_type as moodtype,
          SUM(count) as count
        FROM parsed_moods
        GROUP BY mood_type
        ORDER BY count DESC
        LIMIT 10
      `;

      const result = await DatabaseService.query(query, [userID]);

      if (!result.rows || result.rows.length === 0) {
        return [];
      }

      const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
      if (total === 0) return [];

      return result.rows.map(row => ({
        moodType: row.moodtype || 'unknown',
        count: parseInt(row.count) || 0,
        percentage: Math.round((parseInt(row.count) / total) * 100)
      }));
    } catch (error) {
      logger.error('Error in ForYouService.getMoodStats:', error);
      return [];
    }
  }

  static async getRecentlySearched(userID, limit = 4) {
    try {
      const query = `
        SELECT DISTINCT ON (s.songid)
          s.songid as id,
          s.songname as title,
          s.artistname as artist,
          COALESCE(p.coverimage, '') as image,
          p.processingid as processingid
        FROM history h
        INNER JOIN songs s ON h.songid = s.songid
        LEFT JOIN songaiprocessing p ON h.processingid = p.processingid
        WHERE h.userid = $1
          AND s.isactive = TRUE
        ORDER BY s.songid, h.timestamp DESC NULLS LAST
        LIMIT $2
      `;

      const result = await DatabaseService.query(query, [userID, limit]);

      if (!result.rows || result.rows.length === 0) {
        return [];
      }

      return result.rows.map(row => ({
        id: row.id,
        title: row.title || 'Unknown',
        artist: row.artist || 'Unknown Artist',
        image: row.image || '/images/cover.jpg',
        processingID: row.processingid || null
      }));
    } catch (error) {
      logger.error('Error in ForYouService.getRecentlySearched:', error);
      return [];
    }
  }

  static async getRecommendations() {
    try {
      const homeContent = await RecommendHomeService.getRecommendedSongs(50, 5);
      
      const subsections = homeContent.sections.map(section => ({
        title: section.title,
        items: section.items.map(item => ({
          id: item.id,
          title: item.title,
          artist: item.artist,
          image: item.image || '/images/cover.jpg',
          processingID: item.processingID || null
        }))
      }));

      return {
        title: 'Our recommend for you',
        description: "Here's the track that matches your mood right now. Hit play and let the rhythm speak for itself.",
        subsections: subsections.length > 0 ? subsections : []
      };
    } catch (error) {
      logger.error('Error in ForYouService.getRecommendations:', error);
      return {
        title: 'Our recommend for you',
        description: "Here's the track that matches your mood right now. Hit play and let the rhythm speak for itself.",
        subsections: []
      };
    }
  }

  static async getTopHits(limit = 5) {
    try {
      const query = `
        SELECT DISTINCT ON (s.songid)
          s.songid as id,
          s.songname as title,
          s.artistname as artist,
          COALESCE(p.coverimage, '') as image,
          p.processingid as processingid
        FROM songs s
        INNER JOIN songaiprocessing p ON s.songid = p.songid
        WHERE s.isactive = TRUE
          AND p.sharestatus = 'public_approved'
          AND p.approvalstatus = 'approved'
          AND p.status = 'completed'
        ORDER BY s.songid, p.totalratings DESC, p.averagerating DESC NULLS LAST
        LIMIT $1
      `;

      const result = await DatabaseService.query(query, [limit]);

      if (!result.rows || result.rows.length === 0) {
        return [];
      }

      return result.rows.map(row => ({
        id: row.id,
        title: row.title || 'Unknown',
        artist: row.artist || 'Unknown Artist',
        image: row.image || '/images/cover.jpg',
        processingID: row.processingid || null
      }));
    } catch (error) {
      logger.error('Error in ForYouService.getTopHits:', error);
      return [];
    }
  }

  static async getYourMood(userID, limit = 20) {
    try {
      const query = `
        WITH user_analysis AS (
          SELECT 
            p.songid,
            COUNT(*) as analysis_count,
            MAX(CASE WHEN p.translation IS NOT NULL AND p.translation != '' THEN 1 ELSE 0 END) as has_translation,
            MAX(p.createdat) as last_analyzed_at
          FROM songaiprocessing p
          WHERE p.createdby = $1
            AND p.status = 'completed'
          GROUP BY p.songid
        ),
        user_favorites AS (
          SELECT 
            f.songid,
            1 as is_favorite
          FROM userfavorites f
          WHERE f.userid = $1
            AND f.favoritetype = 'song'
            AND f.songid IS NOT NULL
        ),
        song_scores AS (
          SELECT 
            s.songid,
            s.songname,
            s.artistname,
            s.genre,
            s.duration,
            COALESCE(ua.analysis_count, 0) as analysis_count,
            COALESCE(ua.has_translation, 0) as has_translation,
            COALESCE(uf.is_favorite, 0) as is_favorite,
            COALESCE(ua.last_analyzed_at, NULL) as last_analyzed_at,
            (
              COALESCE(ua.analysis_count, 0) * 3 +
              COALESCE(ua.has_translation, 0) * 2 +
              COALESCE(uf.is_favorite, 0) * 2
            ) as score
          FROM songs s
          LEFT JOIN user_analysis ua ON s.songid = ua.songid
          LEFT JOIN user_favorites uf ON s.songid = uf.songid
          WHERE s.isactive = TRUE
            AND (
              ua.songid IS NOT NULL 
              OR uf.songid IS NOT NULL
            )
        ),
        ranked_songs AS (
          SELECT 
            ss.*,
            (
              SELECT p.processingid
              FROM songaiprocessing p
              WHERE p.songid = ss.songid
                AND p.createdby = $1
                AND p.status = 'completed'
              ORDER BY p.createdat DESC
              LIMIT 1
            ) as processingid,
            (
              SELECT p.coverimage
              FROM songaiprocessing p
              WHERE p.songid = ss.songid
                AND p.createdby = $1
                AND p.status = 'completed'
              ORDER BY p.createdat DESC
              LIMIT 1
            ) as coverimage,
            (
              SELECT p.moodtype
              FROM songaiprocessing p
              WHERE p.songid = ss.songid
                AND p.createdby = $1
                AND p.status = 'completed'
                AND p.moodtype IS NOT NULL
              ORDER BY p.createdat DESC
              LIMIT 1
            ) as moodtype
          FROM song_scores ss
        )
        SELECT 
          songid,
          songname,
          artistname,
          genre,
          duration,
          processingid,
          coverimage,
          moodtype,
          analysis_count,
          has_translation,
          is_favorite,
          score,
          last_analyzed_at
        FROM ranked_songs
        WHERE score > 0
        ORDER BY score DESC, last_analyzed_at DESC NULLS LAST
        LIMIT $2
      `;

      const result = await DatabaseService.query(query, [userID, limit]);

      if (!result.rows || result.rows.length === 0) {
        return [];
      }

      const songs = result.rows.map(row => {
        let topMood = null;
        if (row.moodtype) {
          try {
            const parsed = JSON.parse(row.moodtype);
            if (Array.isArray(parsed) && parsed.length > 0) {
              topMood = parsed[0];
            }
          } catch (e) {
            if (row.moodtype) {
              topMood = { type: row.moodtype, percentage: 0 };
            }
          }
        }

        return {
          id: row.songid,
          processingID: row.processingid,
          title: row.songname,
          artist: row.artistname || 'Unknown Artist',
          genre: row.genre,
          duration: row.duration,
          image: row.coverimage || null,
          mood: topMood,
          analysisCount: parseInt(row.analysis_count) || 0,
          hasTranslation: row.has_translation === 1,
          isFavorite: row.is_favorite === 1,
          score: parseInt(row.score) || 0,
          lastAnalyzedAt: row.last_analyzed_at
        };
      });

      return songs;
    } catch (error) {
      logger.error('Error in ForYouService.getYourMood:', error);
      throw error;
    }
  }
}

module.exports = ForYouService;

