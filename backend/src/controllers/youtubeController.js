const YouTubeService = require('../services/youtubeService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');

const searchVideos = async (req, res) => {
  try {
    const { songName, artistName, maxResults } = req.query;

    if (!songName || songName.trim() === '') {
      return res.status(400).json(
        errorResponse('songName is required', 400)
      );
    }

    const maxResultsNum = maxResults ? parseInt(maxResults) : 5;
    if (isNaN(maxResultsNum) || maxResultsNum < 1 || maxResultsNum > 50) {
      return res.status(400).json(
        errorResponse('maxResults must be between 1 and 50', 400)
      );
    }

    logger.info('YouTube search request', { songName, artistName, maxResults: maxResultsNum });

    const videos = await YouTubeService.searchVideos(
      songName.trim(),
      artistName ? artistName.trim() : null,
      maxResultsNum
    );

    return res.json(
      successResponse('YouTube videos found', { videos })
    );

  } catch (error) {
    logger.error('Error in searchVideos:', error);

    if (error.message.includes('API key')) {
      return res.status(500).json(
        errorResponse('YouTube API is not configured', 500)
      );
    }

    if (error.message.includes('required')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to search YouTube videos', 500, error.message)
    );
  }
};

const getVideoDetails = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId || videoId.trim() === '') {
      return res.status(400).json(
        errorResponse('videoId is required', 400)
      );
    }

    logger.info('YouTube video details request', { videoId });

    const videoDetails = await YouTubeService.getVideoDetails(videoId.trim());

    return res.json(
      successResponse('YouTube video details retrieved', videoDetails)
    );

  } catch (error) {
    logger.error('Error in getVideoDetails:', error);

    if (error.message.includes('API key')) {
      return res.status(500).json(
        errorResponse('YouTube API is not configured', 500)
      );
    }

    if (error.message.includes('not found')) {
      return res.status(404).json(
        errorResponse(error.message, 404)
      );
    }

    if (error.message.includes('required')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to get YouTube video details', 500, error.message)
    );
  }
};

module.exports = {
  searchVideos,
  getVideoDetails
};

