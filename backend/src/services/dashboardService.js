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

class DashboardService {
  static async getDashboardStats() {
    const client = await pool.connect();
    try {
      const totalUsersQuery = 'SELECT COUNT(*) as count FROM users';
      const totalSongsQuery = 'SELECT COUNT(*) as count FROM songs';
      const pendingApprovalQuery = `
        SELECT COUNT(*) as count 
        FROM songaiprocessing 
        WHERE (approvalstatus = 'pending' OR sharestatus = 'public_pending')
      `;
      const totalSessionsQuery = 'SELECT COUNT(*) as count FROM usersessions WHERE isactive = true';
      
      const [usersResult, songsResult, approvalResult, sessionsResult] = await Promise.all([
        client.query(totalUsersQuery),
        client.query(totalSongsQuery),
        client.query(pendingApprovalQuery),
        client.query(totalSessionsQuery)
      ]);

      return {
        totalUsers: parseInt(usersResult.rows[0].count),
        totalSongs: parseInt(songsResult.rows[0].count),
        pendingApproval: parseInt(approvalResult.rows[0].count),
        totalSessions: parseInt(sessionsResult.rows[0].count)
      };
    } catch (error) {
      logger.error('Error in getDashboardStats:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getTrafficData(days = 30) {
    const client = await pool.connect();
    try {
      const sanitizedDays = Math.max(1, Math.min(365, parseInt(days) || 30));
      const query = `
        SELECT 
          DATE(createdat) as date,
          COUNT(*) as count
        FROM usersessions
        WHERE createdat >= NOW() - INTERVAL '${sanitizedDays} days'
        GROUP BY DATE(createdat)
        ORDER BY date ASC
      `;

      const result = await client.query(query);
      
      return result.rows.map(row => ({
        date: row.date.toISOString().split('T')[0],
        traffic: parseInt(row.count)
      }));
    } catch (error) {
      logger.error('Error in getTrafficData:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getSongsByMood() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT DISTINCT
          p.processingid,
          p.moodtype
        FROM songaiprocessing p
        INNER JOIN songs s ON p.songid = s.songid
        WHERE p.moodtype IS NOT NULL 
          AND p.moodtype != ''
          AND p.status = 'completed'
          AND s.isactive = TRUE
      `;

      const result = await client.query(query);
      
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
      
      result.rows.forEach(row => {
        if (!row.moodtype) return;
        
        try {
          const moods = JSON.parse(row.moodtype);
          
          if (Array.isArray(moods) && moods.length > 0) {
            moods.forEach(moodItem => {
              let moodRaw = null;
              
              if (typeof moodItem === 'object' && moodItem !== null && moodItem.type) {
                moodRaw = moodItem.type;
              } else if (typeof moodItem === 'string') {
                moodRaw = moodItem;
              }
              
              if (moodRaw) {
                const normalized = normalizeMainMood(moodRaw);
                if (normalized) {
                  let targetCategory = normalized;
                  if (!mainMoodCategories.includes(normalized)) {
                    targetCategory = moodCategoryMapping[normalized.toLowerCase()] || 'Happy';
                  }
                  moodMap.set(targetCategory, moodMap.get(targetCategory) + 1);
                }
              }
            });
          } else if (typeof moods === 'object' && moods !== null && moods.type) {
            const normalized = normalizeMainMood(moods.type);
            if (normalized) {
              let targetCategory = normalized;
              if (!mainMoodCategories.includes(normalized)) {
                targetCategory = moodCategoryMapping[normalized.toLowerCase()] || 'Happy';
              }
              moodMap.set(targetCategory, moodMap.get(targetCategory) + 1);
            }
          } else if (typeof moods === 'string') {
            const normalized = normalizeMainMood(moods);
            if (normalized) {
              let targetCategory = normalized;
              if (!mainMoodCategories.includes(normalized)) {
                targetCategory = moodCategoryMapping[normalized.toLowerCase()] || 'Happy';
              }
              moodMap.set(targetCategory, moodMap.get(targetCategory) + 1);
            }
          }
        } catch {
          if (typeof row.moodtype === 'string') {
            const normalized = normalizeMainMood(row.moodtype);
            if (normalized) {
              let targetCategory = normalized;
              if (!mainMoodCategories.includes(normalized)) {
                targetCategory = moodCategoryMapping[normalized.toLowerCase()] || 'Happy';
              }
              moodMap.set(targetCategory, moodMap.get(targetCategory) + 1);
            }
          }
        }
      });
      
      return Array.from(moodMap.entries())
        .map(([mood, songs]) => ({
          mood: mood,
          songs: songs
        }))
        .filter(item => item.songs > 0)
        .sort((a, b) => b.songs - a.songs);
    } catch (error) {
      logger.error('Error in getSongsByMood:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = DashboardService;

