const { pool } = require('../config/database');
const { logger } = require('../middleware/logger');

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
      return 'Love';
    case 'playful':
      return 'Playful';
    case 'calm':
      return 'Calm';
    case 'sleepy':
      return 'Sleepy';
    case 'neutral':
      return 'Neutral';
    case 'sick':
      return 'Sick';
    case 'embarrassed':
      return 'Embarrassed';
    case 'dizzy':
      return 'Dizzy';
    case 'broken heart':
      return 'Broken Heart';
    case 'cool':
      return 'Cool';
    case 'mixed':
      return 'Mixed';
    case 'awkward':
      return 'Awkward';
    case 'wink':
      return 'Wink';
    case 'hearts':
      return 'Hearts';
    case 'angel':
      return 'Angel';
    default:
      return null;
  }
}

class AdminAnalysisService {
  static async getAnalysisData() {
    const client = await pool.connect();
    try {
      const totalSongsQuery = `
        SELECT COUNT(DISTINCT s.songid) as count
        FROM songs s
        INNER JOIN songaiprocessing p ON s.songid = p.songid
        WHERE s.isactive = TRUE
          AND p.status = 'completed'
          AND p.sharestatus = 'public_approved'
          AND p.approvalstatus = 'approved'
          AND p.moodtype IS NOT NULL
          AND p.moodtype != ''
      `;

      const moodStatsQuery = `
        SELECT 
          p.moodtype,
          COUNT(*) as count
        FROM songaiprocessing p
        INNER JOIN songs s ON p.songid = s.songid
        WHERE p.moodtype IS NOT NULL 
          AND p.moodtype != ''
          AND p.status = 'completed'
          AND s.isactive = TRUE
          AND p.sharestatus = 'public_approved'
          AND p.approvalstatus = 'approved'
        GROUP BY p.moodtype
      `;

      const ratingStatsQuery = `
        SELECT 
          COUNT(DISTINCT r.ratingid) as feedback_count,
          COALESCE(AVG(r.rating), 0) as average_rating
        FROM aiprocessingratings r
        INNER JOIN songaiprocessing p ON r.processingid = p.processingid
        INNER JOIN songs s ON p.songid = s.songid
        WHERE s.isactive = TRUE
          AND p.status = 'completed'
          AND p.sharestatus = 'public_approved'
          AND p.approvalstatus = 'approved'
      `;

      const suggestionsQuery = `
        SELECT 
          r.ratingid,
          r.processingid,
          r.rating,
          r.comment,
          r.feedback,
          r.createdat,
          s.songname
        FROM aiprocessingratings r
        INNER JOIN songaiprocessing p ON r.processingid = p.processingid
        INNER JOIN songs s ON p.songid = s.songid
        WHERE s.isactive = TRUE
          AND p.status = 'completed'
          AND p.sharestatus = 'public_approved'
          AND p.approvalstatus = 'approved'
          AND (r.comment IS NOT NULL AND r.comment != '' OR r.feedback IS NOT NULL AND r.feedback != '')
        ORDER BY r.createdat DESC
        LIMIT 10
      `;

      const [totalSongsResult, moodStatsResult, ratingStatsResult, suggestionsResult] = await Promise.all([
        client.query(totalSongsQuery),
        client.query(moodStatsQuery),
        client.query(ratingStatsQuery),
        client.query(suggestionsQuery)
      ]);

      const totalSongs = parseInt(totalSongsResult.rows[0]?.count || 0);

      const mainMoodCategories = ['Happy', 'Sad', 'Fear', 'Anger', 'Disgust', 'Surprise'];
      const moodCategoryMapping = {
        'love': 'Happy',
        'playful': 'Happy',
        'calm': 'Happy',
        'hearts': 'Happy',
        'angel': 'Happy',
        'wink': 'Happy',
        'cool': 'Happy',
        'sleepy': 'Sad',
        'broken heart': 'Sad',
        'neutral': 'Sad',
        'sick': 'Disgust',
        'embarrassed': 'Disgust',
        'dizzy': 'Disgust',
        'awkward': 'Disgust',
        'mixed': 'Surprise'
      };

      const moodMap = new Map();
      mainMoodCategories.forEach(mood => {
        moodMap.set(mood, 0);
      });

      moodStatsResult.rows.forEach(row => {
        if (!row.moodtype) return;
        
        try {
          const moods = JSON.parse(row.moodtype);
          if (Array.isArray(moods) && moods.length > 0) {
            const firstMood = moods[0];
            let primaryMood = 'Unknown';
            
            if (typeof firstMood === 'object' && firstMood !== null && firstMood.type) {
              primaryMood = firstMood.type;
            } else if (typeof firstMood === 'string') {
              primaryMood = firstMood;
            }
            
            const normalized = normalizeMainMood(primaryMood);
            if (normalized) {
              let targetCategory = normalized;
              if (!mainMoodCategories.includes(normalized)) {
                targetCategory = moodCategoryMapping[normalized.toLowerCase()] || 'Happy';
              }
              const count = parseInt(row.count);
              moodMap.set(targetCategory, moodMap.get(targetCategory) + count);
            }
          } else if (typeof moods === 'object' && moods !== null && moods.type) {
            const primaryMood = moods.type;
            const normalized = normalizeMainMood(primaryMood);
            if (normalized) {
              let targetCategory = normalized;
              if (!mainMoodCategories.includes(normalized)) {
                targetCategory = moodCategoryMapping[normalized.toLowerCase()] || 'Happy';
              }
              const count = parseInt(row.count);
              moodMap.set(targetCategory, moodMap.get(targetCategory) + count);
            }
          } else if (typeof moods === 'string') {
            const primaryMood = moods;
            const normalized = normalizeMainMood(primaryMood);
            if (normalized) {
              let targetCategory = normalized;
              if (!mainMoodCategories.includes(normalized)) {
                targetCategory = moodCategoryMapping[normalized.toLowerCase()] || 'Happy';
              }
              const count = parseInt(row.count);
              moodMap.set(targetCategory, moodMap.get(targetCategory) + count);
            }
          }
        } catch {
          if (typeof row.moodtype === 'string') {
            const primaryMood = row.moodtype;
            const normalized = normalizeMainMood(primaryMood);
            if (normalized) {
              let targetCategory = normalized;
              if (!mainMoodCategories.includes(normalized)) {
                targetCategory = moodCategoryMapping[normalized.toLowerCase()] || 'Happy';
              }
              const count = parseInt(row.count);
              moodMap.set(targetCategory, moodMap.get(targetCategory) + count);
            }
          }
        }
      });

      const moodStats = mainMoodCategories.map(mood => ({
        label: mood,
        value: moodMap.get(mood) || 0
      }));


      const feedbackCount = parseInt(ratingStatsResult.rows[0]?.feedback_count || 0);
      const averageRating = parseFloat(ratingStatsResult.rows[0]?.average_rating || 0);

      const suggestions = suggestionsResult.rows.map(row => ({
        id: row.ratingid,
        processingID: row.processingid,
        songName: row.songname,
        rating: parseFloat(row.rating),
        comment: row.comment || row.feedback || '',
        date: row.createdat ? new Date(row.createdat).toISOString().split('T')[0] : null,
        createdAt: row.createdat
      }));

      const subMoodData = await this.getSubMoodData(client);

      return {
        totalSongs,
        moodStats,
        feedbackCount,
        averageRating,
        suggestions,
        subMoodData
      };
    } catch (error) {
      logger.error('Error in AdminAnalysisService.getAnalysisData:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getSubMoodData(client) {
    try {
      const query = `
        SELECT 
          p.moodtype
        FROM songaiprocessing p
        INNER JOIN songs s ON p.songid = s.songid
        WHERE p.moodtype IS NOT NULL 
          AND p.moodtype != ''
          AND p.status = 'completed'
          AND s.isactive = TRUE
          AND p.sharestatus = 'public_approved'
          AND p.approvalstatus = 'approved'
      `;

      const result = await client.query(query);

      const mainMoodCategories = ['Happy', 'Sad', 'Fear', 'Anger', 'Disgust', 'Surprise'];
      const subMoodMap = {
        Happy: new Map(),
        Sad: new Map(),
        Fear: new Map(),
        Anger: new Map(),
        Disgust: new Map(),
        Surprise: new Map()
      };

      const moodCategoryMapping = {
        'love': 'Happy',
        'playful': 'Happy',
        'calm': 'Happy',
        'hearts': 'Happy',
        'angel': 'Happy',
        'wink': 'Happy',
        'cool': 'Happy',
        'sleepy': 'Sad',
        'broken heart': 'Sad',
        'neutral': 'Sad',
        'sick': 'Disgust',
        'embarrassed': 'Disgust',
        'dizzy': 'Disgust',
        'awkward': 'Disgust',
        'mixed': 'Surprise'
      };

      result.rows.forEach(row => {
        if (!row.moodtype) return;
        
        try {
          const moods = JSON.parse(row.moodtype);
          if (Array.isArray(moods) && moods.length > 0) {
            const firstMood = moods[0];
            let primaryMoodRaw = null;
            
            if (typeof firstMood === 'object' && firstMood !== null && firstMood.type) {
              primaryMoodRaw = firstMood.type;
            } else if (typeof firstMood === 'string') {
              primaryMoodRaw = firstMood;
            }
            
            if (!primaryMoodRaw) return;
            
            const normalizedPrimary = normalizeMainMood(primaryMoodRaw);
            if (!normalizedPrimary) return;
            
            let targetCategory = normalizedPrimary;
            if (!mainMoodCategories.includes(normalizedPrimary)) {
              targetCategory = moodCategoryMapping[normalizedPrimary.toLowerCase()] || 'Happy';
            }
            
            moods.forEach((mood, index) => {
              let subMoodRaw = null;
              if (typeof mood === 'object' && mood !== null && mood.type) {
                subMoodRaw = mood.type;
              } else if (typeof mood === 'string') {
                subMoodRaw = mood;
              }
              
              if (!subMoodRaw) return;
              
              const normalizedSub = normalizeMainMood(subMoodRaw);
              if (!normalizedSub) return;
              
              if (index === 0 && !mainMoodCategories.includes(normalizedPrimary)) {
                const currentCount = subMoodMap[targetCategory].get(normalizedSub) || 0;
                subMoodMap[targetCategory].set(normalizedSub, currentCount + 1);
              } else if (index > 0 && normalizedSub !== targetCategory) {
                const currentCount = subMoodMap[targetCategory].get(normalizedSub) || 0;
                subMoodMap[targetCategory].set(normalizedSub, currentCount + 1);
              }
            });
          }
        } catch (e) {
          logger.debug('Failed to parse moodType in sub-mood data:', e);
        }
      });

      const subMoodData = {};
      mainMoodCategories.forEach(mainMood => {
        const subMoods = Array.from(subMoodMap[mainMood].entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);
        
        if (subMoods.length > 0) {
          subMoodData[mainMood] = subMoods;
        }
      });

      return subMoodData;
    } catch (error) {
      logger.error('Error in AdminAnalysisService.getSubMoodData:', error);
      throw error;
    }
  }
}

module.exports = AdminAnalysisService;

