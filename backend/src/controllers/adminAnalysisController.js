const AdminAnalysisService = require('../services/adminAnalysisService');
const { logger } = require('../middleware/logger');

const getAnalysisData = async (req, res) => {
  try {
    const data = await AdminAnalysisService.getAnalysisData();
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error in getAnalysisData controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analysis data',
      statusCode: 500,
      errors: error.message
    });
  }
};

module.exports = {
  getAnalysisData
};

