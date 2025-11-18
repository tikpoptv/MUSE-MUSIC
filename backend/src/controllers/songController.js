const SongService = require('../services/songService');
const HistoryService = require('../services/historyService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');

const getSongDetail = async (req, res) => {
  try {
    const { songID } = req.params;
    const { processingID } = req.query;

    if (!songID || songID === 'undefined') {
      return res.status(400).json(
        errorResponse('songID is required', 400)
      );
    }

    logger.info('Fetching song detail', { songID, processingID });

    const result = await SongService.getSongDetail(songID, processingID || null);

    if (req.user && req.user.userID && processingID && processingID !== 'undefined') {
      const deviceInfo = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
      HistoryService.recordViewHistory(
        req.user.userID,
        songID,
        processingID,
        deviceInfo
      ).catch(err => {
        logger.warn('Failed to record view history:', err);
      });
    }

    return res.json(
      successResponse('Song detail fetched successfully', result)
    );
  } catch (error) {
    logger.error('Error in getSongDetail:', error);

    if (error.message.includes('not found') || error.message.includes('Invalid')) {
      return res.status(404).json(
        errorResponse(error.message, 404)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to fetch song detail', 500, error.message)
    );
  }
};

const getProcessingVersions = async (req, res) => {
  try {
    const { songID } = req.params;
    const { targetLanguage } = req.query;

    if (!songID || songID === 'undefined') {
      return res.status(400).json(
        errorResponse('songID is required', 400)
      );
    }

    const versions = await SongService.getProcessingVersions(
      songID,
      targetLanguage || null
    );

    return res.json(
      successResponse('Processing versions fetched successfully', {
        versions
      })
    );
  } catch (error) {
    logger.error('Error in getProcessingVersions:', error);

    if (error.message.includes('Invalid') || error.message.includes('required')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to fetch processing versions', 500, error.message)
    );
  }
};

const checkProcessingByLanguage = async (req, res) => {
  try {
    const { songID } = req.params;
    const { targetLanguage } = req.query;

    if (!songID || songID === 'undefined') {
      return res.status(400).json(
        errorResponse('songID is required', 400)
      );
    }

    if (!targetLanguage) {
      return res.status(400).json(
        errorResponse('targetLanguage is required', 400)
      );
    }

    logger.info('Checking processing by language', { songID, targetLanguage });

    const result = await SongService.checkProcessingByLanguage(songID, targetLanguage);

    return res.json(
      successResponse('Processing check completed', result)
    );
  } catch (error) {
    logger.error('Error in checkProcessingByLanguage:', error);

    if (error.message.includes('not found') || error.message.includes('Invalid')) {
      return res.status(404).json(
        errorResponse(error.message, 404)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to check processing', 500, error.message)
    );
  }
};

const searchSongs = async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json(
        errorResponse('Search query (q) is required', 400)
      );
    }

    const limitNum = limit ? parseInt(limit) : 10;
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json(
        errorResponse('limit must be between 1 and 50', 400)
      );
    }

    logger.info('Searching songs', { query: q, limit: limitNum });

    const results = await SongService.searchSongs(q, limitNum);

    return res.json(
      successResponse('Songs search completed', { songs: results })
    );
  } catch (error) {
    logger.error('Error in searchSongs:', error);
    return res.status(500).json(
      errorResponse('Failed to search songs', 500, error.message)
    );
  }
};

module.exports = {
  getSongDetail,
  getProcessingVersions,
  checkProcessingByLanguage,
  searchSongs
};

