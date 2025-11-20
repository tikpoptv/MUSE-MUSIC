const YouTubeService = require('../services/youtubeService');
const AnalysisService = require('../services/analysisService');
const JWTService = require('../services/jwtService');
const {
  transcriptToLRC,
  transcriptToPlainText,
  extractLyricsPreview,
  parseArtistFromTitle
} = require('../utils/youtubeTranscriptUtils');
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

const getTranscript = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { format = 'raw', languages, mode = 'fallback' } = req.query;

    if (!videoId || videoId.trim() === '') {
      return res.status(400).json(
        errorResponse('videoId is required', 400)
      );
    }

    let languagesList;
    if (languages) {
      languagesList = languages
        .split(',')
        .map(lang => lang.trim())
        .filter(Boolean);
    }

    const normalizedMode = mode === 'multi' ? 'multi' : 'fallback';

    logger.info('YouTube transcript request', {
      videoId,
      format,
      languages: languagesList,
      mode: normalizedMode
    });

    const transcript = await YouTubeService.getTranscript(videoId.trim(), {
      format: format === 'text' ? 'text' : 'raw',
      languages: languagesList,
      strategy: normalizedMode
    });

    let videoDetails = null;
    try {
      videoDetails = await YouTubeService.getVideoDetails(videoId.trim());
    } catch (error) {
      logger.warn('Failed to fetch YouTube video details for transcript request', {
        videoId,
        error: error.message
      });
    }

    return res.json(
      successResponse('YouTube transcript retrieved', {
        ...transcript,
        videoDetails
      })
    );
  } catch (error) {
    logger.error('Error in getTranscript:', error);

    if (error.message.includes('Video ID is required')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to fetch YouTube transcript', 500, error.message)
    );
  }
};

const startYoutubeAnalysis = async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = JWTService.extractTokenFromHeader(authHeader);
      if (token) {
        const decoded = JWTService.verifyAccessToken(token);
        if (decoded && decoded.userID) {
          userId = decoded.userID;
        }
      }
    }

    const { videoId, actions, translationConfig, shareRequest = false } = req.body;

    if (!videoId || videoId.trim() === '') {
      return res.status(400).json(
        errorResponse('videoId is required', 400)
      );
    }

    if (!actions || typeof actions !== 'object') {
      return res.status(400).json(
        errorResponse('actions object is required', 400)
      );
    }

    if (!actions.translate && !actions.mood) {
      return res.status(400).json(
        errorResponse('At least one action (translate or mood) must be enabled', 400)
      );
    }

    if (actions.translate) {
      if (!translationConfig || !translationConfig.targetLanguage) {
        return res.status(400).json(
          errorResponse('translationConfig.targetLanguage is required when translate is enabled', 400)
        );
      }
    }

    const normalizedVideoId = videoId.trim();

    logger.info('Starting YouTube analysis request', {
      videoId: normalizedVideoId,
      hasTranslate: actions.translate,
      hasMood: actions.mood
    });

    const transcriptResponse = await YouTubeService.getTranscript(normalizedVideoId, {
      format: 'raw',
      strategy: 'fallback'
    });
    const videoDetails = await YouTubeService.getVideoDetails(normalizedVideoId);

    let transcriptSegments = [];
    const rawTranscript = transcriptResponse?.transcript;
    if (Array.isArray(rawTranscript)) {
      transcriptSegments = rawTranscript;
    } else if (rawTranscript && typeof rawTranscript === 'object') {
      const firstArray = Object.values(rawTranscript).find((value) => Array.isArray(value));
      transcriptSegments = firstArray || [];
    }

    if (transcriptSegments.length === 0) {
      return res.status(500).json(
        errorResponse('No transcript segments available for this video', 500)
      );
    }

    const plainLyrics = transcriptToPlainText(transcriptSegments);
    if (!plainLyrics) {
      return res.status(500).json(
        errorResponse('YouTube transcript does not contain valid lyrics', 500)
      );
    }

    const syncedLyrics = transcriptToLRC(transcriptSegments);
    const lyricsPreview = extractLyricsPreview(transcriptSegments);
    const inferredArtist = parseArtistFromTitle(videoDetails?.title, videoDetails?.channelTitle);
    const youtubeLanguages = transcriptResponse?.languages || [];

    const finalTranslationConfig = {
      originalLanguage: translationConfig?.originalLanguage
        || youtubeLanguages?.[0]
        || null,
      targetLanguage: translationConfig?.targetLanguage
    };

    const albumDescription = videoDetails?.description
      ? videoDetails.description.split('\n').slice(0, 2).join(' ').substring(0, 200)
      : `YouTube Channel: ${videoDetails?.channelTitle || 'Unknown'}`;

    const lyricsRecord = {
      id: normalizedVideoId,
      trackName: videoDetails?.title || `YouTube Video ${normalizedVideoId}`,
      artistName: inferredArtist,
      albumName: albumDescription,
      duration: videoDetails?.duration || null,
      instrumental: false,
      plainLyrics,
      lyrics: plainLyrics,
      source: 'youtube',
      sourceStatus: 'external',
      coverImage: videoDetails?.thumbnail || null,
      youtubeVideoId: normalizedVideoId,
      lyricsPreview
    };

    const result = await AnalysisService.process(
      lyricsRecord,
      actions,
      finalTranslationConfig,
      userId,
      shareRequest
    );

    return res.json(
      successResponse('YouTube analysis completed successfully', {
        ...result,
        videoDetails,
        syncedLyrics,
        transcript: transcriptSegments
      })
    );
  } catch (error) {
    logger.error('Error in startYoutubeAnalysis:', error);

    if (error.message.includes('required') || error.message.includes('must')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to process YouTube analysis', 500, error.message)
    );
  }
};

module.exports = {
  searchVideos,
  getVideoDetails,
  getTranscript,
  startYoutubeAnalysis
};

