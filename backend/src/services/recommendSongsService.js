const DatabaseService = require('./databaseService');
const { logger } = require('../middleware/logger');

class RecommendSongsService {
  static async getRecommendedSongsByLanguageAndMood(language, mood, limit = 10, excludeSongID = null) {
    try {

      const queryParams = [];
      const conditions = [];

      conditions.push(`p.sharestatus = 'public_approved'`);
      conditions.push(`p.approvalstatus = 'approved'`);
      conditions.push(`s.isactive = TRUE`);

      if (language) {
        const { getLanguageNameByCode } = require('../utils/languageUtils');
        const languageName = getLanguageNameByCode(language) || language;
        conditions.push(`p.originallanguage = $${queryParams.length + 1}`);
        queryParams.push(languageName);
      }

      if (mood) {
        conditions.push(`(
          SELECT mood_item->>'type'
          FROM jsonb_array_elements(
            CASE 
              WHEN p.moodtype::text LIKE '[%' THEN p.moodtype::jsonb
              WHEN p.moodtype IS NOT NULL THEN p.moodtype::jsonb
              ELSE '[]'::jsonb
            END
          ) AS mood_item
          ORDER BY (mood_item->>'percentage')::numeric DESC
          LIMIT 1
        ) = $${queryParams.length + 1}`);
        queryParams.push(mood);
      }

      if (excludeSongID) {
        conditions.push(`p.songid <> $${queryParams.length + 1}`);
        queryParams.push(excludeSongID);
      }

      const recommendedQuery = `
        WITH RankedProcessing AS (
          SELECT 
            p.processingid,
            p.songid,
            p.totalratings,
            p.averagerating,
            p.coverimage,
            p.createdat,
            p.originallanguage,
            p.moodtype,
            s.songname,
            s.artistname,
            s.genre,
            s.duration,
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
          WHERE ${conditions.join(' AND ')}
        )
        SELECT 
          processingid,
          songid,
          songname,
          artistname,
          genre,
          duration,
          coverimage,
          totalratings,
          averagerating,
          createdat,
          originallanguage,
          moodtype
        FROM RankedProcessing
        WHERE rn = 1
        ORDER BY 
          CASE WHEN totalratings > 0 THEN 0 ELSE 1 END,
          totalratings DESC,
          averagerating DESC NULLS LAST,
          createdat DESC
        LIMIT $${queryParams.length + 1}
      `;

      queryParams.push(limit || 10);
      const result = await DatabaseService.query(recommendedQuery, queryParams);

      if (!result.rows || result.rows.length === 0) {
        logger.warn('No recommended songs found', { language, mood, limit });
        return [];
      }

      const songs = result.rows.map(row => {
        let topMood = null;
        if (row.moodtype) {
          try {
            const parsed = JSON.parse(row.moodtype);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const sortedMoods = [...parsed].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
              topMood = sortedMoods[0];
            }
          } catch (e) {
            // Fallback for non-JSON moodType (backward compatibility)
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
          originalLanguage: row.originallanguage || 'Unknown',
          moodType: row.moodtype,
          mood: topMood,
          totalRatings: row.totalratings || 0,
          averageRating: row.averagerating ? parseFloat(row.averagerating) : null,
          createdAt: row.createdat
        };
      });

      logger.info(`Retrieved ${songs.length} recommended songs`, { language, mood, limit });

      return songs;
    } catch (error) {
      logger.error('Error in RecommendSongsService.getRecommendedSongsByLanguageAndMood:', error);
      throw error;
    }
  }
}

module.exports = RecommendSongsService;

