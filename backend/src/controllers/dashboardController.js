const DashboardService = require('../services/dashboardService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');

const getDashboardData = async (req, res) => {
  try {
    const days = Math.max(1, Math.min(365, parseInt(req.query.days) || 30));
    
    const [stats, trafficData, songsByMood] = await Promise.all([
      DashboardService.getDashboardStats(),
      DashboardService.getTrafficData(days),
      DashboardService.getSongsByMood()
    ]);

    return res.json(
      successResponse('Dashboard data retrieved successfully', {
        stats: {
          totalUsers: stats.totalUsers || 0,
          totalSongs: stats.totalSongs || 0,
          pendingApproval: stats.pendingApproval || 0,
          totalSessions: stats.totalSessions || 0
        },
        trafficData: Array.isArray(trafficData) ? trafficData : [],
        songsByMood: Array.isArray(songsByMood) ? songsByMood : []
      })
    );
  } catch (error) {
    logger.error('Error in getDashboardData:', error);
    return res.status(500).json(
      errorResponse('Failed to retrieve dashboard data', 500, error.message)
    );
  }
};

module.exports = {
  getDashboardData
};

