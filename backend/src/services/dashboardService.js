const { pool } = require('../config/database');
const { logger } = require('../middleware/logger');

class DashboardService {
  static async getDashboardStats() {
    const client = await pool.connect();
    try {
      const totalUsersQuery = 'SELECT COUNT(*) as count FROM Users';
      const totalSongsQuery = 'SELECT COUNT(*) as count FROM Songs';
      const pendingApprovalQuery = `
        SELECT COUNT(*) as count 
        FROM SongAIProcessing 
        WHERE (approvalStatus = 'pending' OR shareStatus = 'public_pending')
      `;
      const totalSessionsQuery = 'SELECT COUNT(*) as count FROM UserSessions WHERE isActive = true';
      
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
          DATE(createdAt) as date,
          COUNT(*) as count
        FROM UserSessions
        WHERE createdAt >= NOW() - INTERVAL '${sanitizedDays} days'
        GROUP BY DATE(createdAt)
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
        SELECT 
          moodType,
          COUNT(*) as count
        FROM SongAIProcessing
        WHERE moodType IS NOT NULL 
          AND moodType != ''
          AND status = 'completed'
          AND (shareStatus = 'public_approved' AND approvalStatus = 'approved')
        GROUP BY moodType
        ORDER BY count DESC
      `;

      const result = await client.query(query);
      
      const moodMap = new Map();
      
      result.rows.forEach(row => {
        let mood = 'Unknown';
        if (!row.moodtype) {
          return;
        }
        
        try {
          const moods = JSON.parse(row.moodtype);
          if (Array.isArray(moods) && moods.length > 0) {
            const firstMood = moods[0];
            if (typeof firstMood === 'object' && firstMood !== null && firstMood.type) {
              mood = firstMood.type;
            } else if (typeof firstMood === 'string') {
              mood = firstMood;
            }
          } else if (typeof moods === 'object' && moods !== null && moods.type) {
            mood = moods.type;
          } else if (typeof moods === 'string') {
            mood = moods;
          }
        } catch {
          if (typeof row.moodtype === 'string') {
            mood = row.moodtype;
          }
        }
        
        const count = parseInt(row.count);
        if (moodMap.has(mood)) {
          moodMap.set(mood, moodMap.get(mood) + count);
        } else {
          moodMap.set(mood, count);
        }
      });
      
      return Array.from(moodMap.entries()).map(([mood, songs]) => ({
        mood: mood,
        songs: songs
      })).sort((a, b) => b.songs - a.songs);
    } catch (error) {
      logger.error('Error in getSongsByMood:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = DashboardService;

