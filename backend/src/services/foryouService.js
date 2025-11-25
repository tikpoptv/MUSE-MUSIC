const DatabaseService = require('./databaseService');
const { pool } = require('../config/database');
const { logger } = require('../middleware/logger');
const RecommendHomeService = require('./recommendHomeService');

function normalizeMainMood(name) {
  if (!name) return null;
  const n = String(name).trim().toLowerCase();
  switch (n) {
    case 'happy':
      return 'Happy';
    case 'sad':
      return 'Sad';
    case 'fear':
      return 'Fear';
    case 'anger':
      return 'Anger';
    case 'disgust':
      return 'Disgust';
    case 'surprise':
      return 'Surprise';
    case 'love':
    case 'playful':
    case 'calm':
    case 'hearts':
    case 'angel':
    case 'wink':
    case 'cool':
      return 'Happy';
    case 'sleepy':
    case 'broken heart':
    case 'neutral':
      return 'Sad';
    case 'sick':
    case 'embarrassed':
    case 'dizzy':
    case 'awkward':
      return 'Disgust';
    case 'mixed':
      return 'Surprise';
    default:
      return null;
  }
}

class ForYouService {
  static async getForYouContent(userID, limit = 100, offset = 0) {
    try {
      const moods = await this.getMoodStats(userID);
      const recentlySearched = await this.getRecentlySearched(userID, 20);
      const recommendations = await this.getRecommendations(limit, offset);
      const topHits = await this.getTopHits(20);

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
    const client = await pool.connect();
    try {
      // Get mood signals prioritizing user's processing, then any public processing from history songs
      const query = `
        WITH user_processing AS (
          SELECT DISTINCT ON (p.songid)
            p.songid,
            p.moodtype,
            p.createdat
          FROM songaiprocessing p
          WHERE p.createdby = $1
            AND p.status = 'completed'
            AND p.moodtype IS NOT NULL
            AND p.moodtype != ''
          ORDER BY p.songid, p.createdat DESC
        ),
        history_songs AS (
          SELECT DISTINCT h.songid
          FROM history h
          WHERE h.userid = $1
        ),
        history_processing AS (
          SELECT DISTINCT ON (p.songid)
            p.songid,
            p.moodtype,
            p.createdat
          FROM songaiprocessing p
          INNER JOIN history_songs hs ON hs.songid = p.songid
          WHERE p.status = 'completed'
            AND p.sharestatus = 'public_approved'
            AND p.moodtype IS NOT NULL
            AND p.moodtype != ''
          ORDER BY p.songid, p.createdat DESC
        ),
        combined_moods AS (
          SELECT songid, moodtype, createdat
          FROM user_processing
          UNION
          SELECT hp.songid, hp.moodtype, hp.createdat
          FROM history_processing hp
          WHERE NOT EXISTS (
            SELECT 1
            FROM user_processing up
            WHERE up.songid = hp.songid
          )
        )
        SELECT moodtype
        FROM combined_moods
      `;

      const result = await client.query(query, [userID]);

      if (!result.rows || result.rows.length === 0) {
        return [];
      }

      const mainMoodCategories = ['Happy', 'Sad', 'Fear', 'Anger', 'Disgust', 'Surprise'];
      const moodMap = new Map();
      mainMoodCategories.forEach(mood => {
        moodMap.set(mood, 0);
      });

      result.rows.forEach(row => {
        if (!row.moodtype) return;

        try {
          const moods = JSON.parse(row.moodtype);

          if (Array.isArray(moods) && moods.length > 0) {
            const maxWeight = 4;
            moods.forEach((moodItem, index) => {
              let moodRaw = null;

              if (typeof moodItem === 'object' && moodItem !== null && moodItem.type) {
                moodRaw = moodItem.type;
              } else if (typeof moodItem === 'string') {
                moodRaw = moodItem;
              }

              if (moodRaw) {
                const normalized = normalizeMainMood(moodRaw);
                if (normalized && moodMap.has(normalized)) {
                  const weight = Math.max(maxWeight - index, 1);
                  moodMap.set(normalized, moodMap.get(normalized) + weight);
                }
              }
            });
          } else if (typeof moods === 'object' && moods !== null && moods.type) {
            const normalized = normalizeMainMood(moods.type);
            if (normalized && moodMap.has(normalized)) {
              moodMap.set(normalized, moodMap.get(normalized) + 4);
            }
          } else if (typeof moods === 'string') {
            const normalized = normalizeMainMood(moods);
            if (normalized && moodMap.has(normalized)) {
              moodMap.set(normalized, moodMap.get(normalized) + 4);
            }
          }
        } catch (e) {
          if (typeof row.moodtype === 'string') {
            const normalized = normalizeMainMood(row.moodtype);
            if (normalized && moodMap.has(normalized)) {
              moodMap.set(normalized, moodMap.get(normalized) + 4);
            }
          }
        }
      });

      const moodStats = Array.from(moodMap.entries())
        .filter(([, count]) => count > 0)
        .map(([mood, count]) => ({
          moodType: mood,
          count: count
        }))
        .sort((a, b) => b.count - a.count);

      if (moodStats.length === 0) {
        return [];
      }

      const total = moodStats.reduce((sum, stat) => sum + stat.count, 0);
      if (total === 0) return [];

      return moodStats.map(stat => ({
        moodType: stat.moodType,
        count: stat.count,
        percentage: Math.round((stat.count / total) * 100)
      }));
    } catch (error) {
      logger.error('Error in ForYouService.getMoodStats:', error);
      return [];
    } finally {
      client.release();
    }
  }

  static async getRecentlySearched(userID, limit = 4) {
    try {
      const query = `
        WITH RecentHistory AS (
          SELECT DISTINCT ON (h.songid)
            h.songid,
            h.processingid,
            h.timestamp
        FROM history h
        INNER JOIN songs s ON h.songid = s.songid
        WHERE h.userid = $1
          AND s.isactive = TRUE
          ORDER BY h.songid, h.timestamp DESC
        ),
        RankedProcessing AS (
          SELECT 
            rh.songid,
            rh.timestamp,
            p.processingid,
            p.coverimage,
            p.moodtype,
            s.songname,
            s.artistname,
            ROW_NUMBER() OVER (
              PARTITION BY rh.songid 
              ORDER BY 
                CASE WHEN p.totalratings > 0 THEN 0 ELSE 1 END,
                p.totalratings DESC,
                p.averagerating DESC NULLS LAST,
                p.createdat DESC
            ) as rn
          FROM RecentHistory rh
          INNER JOIN songs s ON rh.songid = s.songid
          LEFT JOIN songaiprocessing p ON (
            p.songid = rh.songid
            AND p.status = 'completed'
          )
        )
        SELECT 
          songid as id,
          songname as title,
          artistname as artist,
          COALESCE(coverimage, '') as image,
          processingid as processingid,
          moodtype as moodtype
        FROM RankedProcessing
        WHERE rn = 1
        ORDER BY timestamp DESC NULLS LAST
        LIMIT $2
      `;

      const result = await DatabaseService.query(query, [userID, limit]);

      if (!result.rows || result.rows.length === 0) {
        return [];
      }

      return result.rows.map(row => {
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
          id: row.id,
          title: row.title || 'Unknown',
          artist: row.artist || 'Unknown Artist',
          image: row.image || '/images/cover.jpg',
          processingID: row.processingid || null,
          mood: topMood
        };
      });
    } catch (error) {
      logger.error('Error in ForYouService.getRecentlySearched:', error);
      return [];
    }
  }

  static async getRecommendations(limit = 100, offset = 0) {
    try {
      const homeContent = await RecommendHomeService.getRecommendedSongs(limit, offset);
      
      const subsections = homeContent.sections.map(section => ({
        title: section.title,
        items: section.items.map(item => ({
          id: item.id,
          title: item.title,
          artist: item.artist,
          image: item.image || '/images/cover.jpg',
          processingID: item.processingID || null,
          mood: item.mood || null
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

  static async getTopHits(limit = 20, offset = 0) {
    try {
      const query = `
        WITH RankedProcessing AS (
          SELECT 
            p.processingid,
            p.songid,
            p.totalratings,
            p.averagerating,
            p.coverimage,
            p.moodtype,
            p.createdat,
            s.songname,
            s.artistname,
            ROW_NUMBER() OVER (
              PARTITION BY p.songid 
              ORDER BY 
                CASE WHEN p.totalratings > 0 THEN 0 ELSE 1 END,
                p.totalratings DESC,
                p.averagerating DESC NULLS LAST,
                p.createdat DESC
            ) as rn
          FROM songaiprocessing p
          INNER JOIN songs s ON p.songid = s.songid
        WHERE s.isactive = TRUE
          AND p.sharestatus = 'public_approved'
          AND p.approvalstatus = 'approved'
          AND p.status = 'completed'
        )
        SELECT 
          songid as id,
          songname as title,
          artistname as artist,
          COALESCE(coverimage, '') as image,
          processingid as processingid,
          moodtype as moodtype,
          totalratings,
          averagerating,
          createdat
        FROM RankedProcessing
        WHERE rn = 1
        ORDER BY 
          CASE WHEN totalratings > 0 THEN 0 ELSE 1 END,
          totalratings DESC,
          averagerating DESC NULLS LAST,
          createdat DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await DatabaseService.query(query, [limit, offset]);

      if (!result.rows || result.rows.length === 0) {
        return [];
      }

      return result.rows.map(row => {
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
          id: row.id,
          title: row.title || 'Unknown',
          artist: row.artist || 'Unknown Artist',
          image: row.image || '/images/cover.jpg',
          processingID: row.processingid || null,
          mood: topMood
        };
      });
    } catch (error) {
      logger.error('Error in ForYouService.getTopHits:', error);
      return [];
    }
  }

  static async getYourMood(userID, limit = 100, offset = 0) {
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
            1 as is_favorite,
            MAX(f.createdat) as favorited_at
          FROM userfavorites f
          WHERE f.userid = $1
            AND f.favoritetype = 'song'
            AND f.songid IS NOT NULL
          GROUP BY f.songid
        ),
        user_history AS (
          SELECT 
            h.songid,
            COUNT(*) FILTER (WHERE h.actiontype = 'view') as view_count,
            COUNT(*) FILTER (WHERE h.actiontype = 'save') as save_count,
            COALESCE(SUM(h.playduration), 0) as total_play_duration,
            MAX(h.timestamp) as last_played_at
          FROM history h
          WHERE h.userid = $1
          GROUP BY h.songid
        ),
        user_ratings AS (
          SELECT 
            p.songid,
            COUNT(r.rating) as rating_count,
            AVG(r.rating)::float as rating_avg,
            MAX(r.createdat) as last_rated_at
          FROM aiprocessingratings r
          INNER JOIN songaiprocessing p ON p.processingid = r.processingid
          WHERE r.userid = $1
          GROUP BY p.songid
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
            ua.last_analyzed_at,
            COALESCE(uh.view_count, 0) as view_count,
            COALESCE(uh.save_count, 0) as save_count,
            COALESCE(uh.total_play_duration, 0) as total_play_duration,
            uh.last_played_at,
            COALESCE(ur.rating_avg, 0) as rating_avg,
            COALESCE(ur.rating_count, 0) as rating_count,
            GREATEST(
              COALESCE(ua.last_analyzed_at, to_timestamp(0)),
              COALESCE(uh.last_played_at, to_timestamp(0)),
              COALESCE(ur.last_rated_at, to_timestamp(0)),
              COALESCE(uf.favorited_at, to_timestamp(0))
            ) as last_activity_at,
            (
              COALESCE(ua.analysis_count, 0) * 3 +
              CASE WHEN COALESCE(ua.has_translation, 0) = 1 THEN 2 ELSE 0 END +
              COALESCE(uf.is_favorite, 0) * 4 +
              COALESCE(uh.view_count, 0) * 1 +
              COALESCE(uh.save_count, 0) * 2 +
              LEAST(COALESCE(uh.total_play_duration, 0) / 60.0, 30) * 0.5 +
              COALESCE(ur.rating_avg, 0) * 1.5 +
              CASE 
                WHEN GREATEST(
                  COALESCE(ua.last_analyzed_at, to_timestamp(0)),
                  COALESCE(uh.last_played_at, to_timestamp(0)),
                  COALESCE(ur.last_rated_at, to_timestamp(0)),
                  COALESCE(uf.favorited_at, to_timestamp(0))
                ) >= NOW() - INTERVAL '7 days' THEN 5
                WHEN GREATEST(
                  COALESCE(ua.last_analyzed_at, to_timestamp(0)),
                  COALESCE(uh.last_played_at, to_timestamp(0)),
                  COALESCE(ur.last_rated_at, to_timestamp(0)),
                  COALESCE(uf.favorited_at, to_timestamp(0))
                ) >= NOW() - INTERVAL '30 days' THEN 3
                WHEN GREATEST(
                  COALESCE(ua.last_analyzed_at, to_timestamp(0)),
                  COALESCE(uh.last_played_at, to_timestamp(0)),
                  COALESCE(ur.last_rated_at, to_timestamp(0)),
                  COALESCE(uf.favorited_at, to_timestamp(0))
                ) >= NOW() - INTERVAL '90 days' THEN 1
                ELSE 0
              END
            ) as score
          FROM songs s
          LEFT JOIN user_analysis ua ON s.songid = ua.songid
          LEFT JOIN user_favorites uf ON s.songid = uf.songid
          LEFT JOIN user_history uh ON s.songid = uh.songid
          LEFT JOIN user_ratings ur ON s.songid = ur.songid
          WHERE s.isactive = TRUE
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
              ORDER BY 
                CASE WHEN p.totalratings > 0 THEN 0 ELSE 1 END,
                p.totalratings DESC,
                p.averagerating DESC NULLS LAST,
                p.createdat DESC
              LIMIT 1
            ) as processingid,
            (
              SELECT p.coverimage
              FROM songaiprocessing p
              WHERE p.songid = ss.songid
                AND p.createdby = $1
                AND p.status = 'completed'
              ORDER BY 
                CASE WHEN p.totalratings > 0 THEN 0 ELSE 1 END,
                p.totalratings DESC,
                p.averagerating DESC NULLS LAST,
                p.createdat DESC
              LIMIT 1
            ) as coverimage,
            (
              SELECT p.moodtype
              FROM songaiprocessing p
              WHERE p.songid = ss.songid
                AND p.createdby = $1
                AND p.status = 'completed'
                AND p.moodtype IS NOT NULL
              ORDER BY 
                CASE WHEN p.totalratings > 0 THEN 0 ELSE 1 END,
                p.totalratings DESC,
                p.averagerating DESC NULLS LAST,
                p.createdat DESC
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
          view_count,
          save_count,
          total_play_duration,
          rating_avg,
          rating_count,
          score,
          last_analyzed_at,
          last_played_at,
          last_activity_at
        FROM ranked_songs
        WHERE score > 0
          AND (
            analysis_count > 0
            OR is_favorite = 1
            OR view_count > 0
            OR save_count > 0
            OR rating_count > 0
          )
        ORDER BY score DESC, last_activity_at DESC NULLS LAST
        LIMIT $2 OFFSET $3
      `;

      const result = await DatabaseService.query(query, [userID, limit, offset]);

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

        const playDuration = row.total_play_duration ? parseInt(row.total_play_duration) : 0;
        const ratingAvg = row.rating_avg ? Number(row.rating_avg) : 0;

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
          viewCount: parseInt(row.view_count) || 0,
          saveCount: parseInt(row.save_count) || 0,
          totalPlayDuration: playDuration,
          ratingAverage: ratingAvg,
          ratingCount: parseInt(row.rating_count) || 0,
          score: Number(row.score) || 0,
          lastAnalyzedAt: row.last_analyzed_at,
          lastPlayedAt: row.last_played_at,
          lastActivityAt: row.last_activity_at
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

