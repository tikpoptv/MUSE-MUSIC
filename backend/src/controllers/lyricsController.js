const lyricsService = require('../services/lyricsService');
const { sendSuccess, sendError, sendValidationError } = require('../utils/response');

const ensureAtLeastOne = (obj, keys) => keys.some(k => obj[k] && `${obj[k]}`.trim() !== '');

const LyricsController = {
  async search(req, res) {
    try {
      const { q, track_name, artist_name, album_name } = req.query;
      if (!ensureAtLeastOne(req.query, ['q', 'track_name'])) {
        return sendValidationError(res, [{ field: 'q|track_name', message: 'At least one of q or track_name is required' }]);
      }
      const data = await lyricsService.search({ q, track_name, artist_name, album_name });
      return sendSuccess(res, data, 'Lyrics search results');
    } catch (error) {
      return sendError(res, error.message || 'Failed to search lyrics', error.status || 500, error.details || null);
    }
  },

  async get(req, res) {
    try {
      const { track_name, artist_name, album_name, duration } = req.query;
      const missing = ['track_name', 'artist_name', 'album_name', 'duration'].filter(k => !req.query[k]);
      if (missing.length) {
        return sendValidationError(res, missing.map(field => ({ field, message: 'This field is required' })));
      }
      const data = await lyricsService.get({ track_name, artist_name, album_name, duration });
      return sendSuccess(res, data, 'Lyrics fetched');
    } catch (error) {
      return sendError(res, error.message || 'Failed to get lyrics', error.status || 500, error.details || null);
    }
  },

  async getCached(req, res) {
    try {
      const { track_name, artist_name, album_name, duration } = req.query;
      const missing = ['track_name', 'artist_name', 'album_name', 'duration'].filter(k => !req.query[k]);
      if (missing.length) {
        return sendValidationError(res, missing.map(field => ({ field, message: 'This field is required' })));
      }
      const data = await lyricsService.getCached({ track_name, artist_name, album_name, duration });
      return sendSuccess(res, data, 'Lyrics fetched (cached only)');
    } catch (error) {
      return sendError(res, error.message || 'Failed to get cached lyrics', error.status || 500, error.details || null);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return sendValidationError(res, [{ field: 'id', message: 'ID is required' }]);
      }
      const data = await lyricsService.getById(id);
      return sendSuccess(res, data, 'Lyrics by ID');
    } catch (error) {
      return sendError(res, error.message || 'Failed to get lyrics by ID', error.status || 500, error.details || null);
    }
  }
};

module.exports = LyricsController;


