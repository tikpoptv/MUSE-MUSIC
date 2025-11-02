const SongService = require('../services/songService');
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

module.exports = {
  getSongDetail
};

