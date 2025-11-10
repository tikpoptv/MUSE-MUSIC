const DatabaseService = require('./databaseService');
const { logger } = require('../middleware/logger');

class RecommendHomeService {
  static async getRecommendedSongs(limit = 50, limitPerSection = 5) {
    try {
      const recommendedQuery = `
        WITH RankedProcessing AS (
          SELECT 
            p.processingid,
            p.songid,
            p.totalratings,
            p.averagerating,
            p.coverimage,
            p.createdat,
            p.sharestatus,
            p.approvalstatus,
            p.originallanguage,
            p.moodtype,
            s.songname,
            s.artistname,
            s.genre,
            s.duration,
            s.isactive,
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
          WHERE 
            p.sharestatus = 'public_approved'
            AND p.approvalstatus = 'approved'
            AND s.isactive = TRUE
            AND p.originallanguage IS NOT NULL
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
        LIMIT $1
      `;

      const queryLimit = limit || 50;
      const result = await DatabaseService.query(recommendedQuery, [queryLimit]);

      if (!result.rows || result.rows.length === 0) {
        logger.warn('No recommended songs found');
        return {
          hero: [],
          sections: []
        };
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
          totalRatings: row.totalratings || 0,
          averageRating: row.averagerating ? parseFloat(row.averagerating) : null,
          createdAt: row.createdat,
          mood: topMood
        };
      });

      const sectionsByLanguage = {};

      songs.forEach(song => {
        const language = song.originalLanguage || 'Unknown';
        if (!sectionsByLanguage[language]) {
          sectionsByLanguage[language] = [];
        }
        if (sectionsByLanguage[language].length < limitPerSection) {
        sectionsByLanguage[language].push({
          id: song.id,
          processingID: song.processingID,
          title: song.title,
          artist: song.artist,
          image: song.image,
          mood: song.mood
        });
        }
      });

      const languageNames = {
        'en': 'English',
        'th': 'Thai',
        'ko': 'Korean',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'vi': 'Vietnamese',
        'id': 'Indonesian',
        'ms': 'Malay',
        'hi': 'Hindi',
        'auto': 'Auto Detect',
        'Unknown': 'Unknown'
      };

      const sections = Object.entries(sectionsByLanguage)
        .filter(([, items]) => items.length > 0)
        .map(([langCode, items]) => ({
          title: languageNames[langCode] || langCode.toUpperCase(),
          items
        }));

      if (sections.length === 0 && songs.length > 0) {
        sections.push({
          title: 'Recommended',
          items: songs.slice(0, limitPerSection).map(song => ({
            id: song.id,
            processingID: song.processingID,
            title: song.title,
            artist: song.artist,
            image: song.image,
            mood: song.mood
          }))
        });
      }

      logger.info(`Retrieved ${sections.length} sections for home page`);

      return {
        hero: [],
        sections
      };
    } catch (error) {
      logger.error('Error in RecommendHomeService.getRecommendedSongs:', error);
      throw error;
    }
  }
}

module.exports = RecommendHomeService;

