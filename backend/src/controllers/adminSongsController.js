const AdminSongsService = require('../services/adminSongsService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');

const getSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const statusFilter = req.query.status || 'all';

    if (page < 1) {
      return res.status(400).json(errorResponse('Page must be greater than 0', 400));
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json(errorResponse('Limit must be between 1 and 100', 400));
    }

    const result = await AdminSongsService.getPendingSongs(page, limit, search, statusFilter);

    return res.json(successResponse('Songs retrieved successfully', result));
  } catch (error) {
    logger.error('Error in getSongs:', error);
    return res.status(500).json(errorResponse('Failed to retrieve songs', 500, error.message));
  }
};

const getPendingCount = async (req, res) => {
  try {
    const count = await AdminSongsService.getPendingCount();
    return res.json(successResponse('Pending count retrieved successfully', { count }));
  } catch (error) {
    logger.error('Error in getPendingCount:', error);
    return res.status(500).json(errorResponse('Failed to retrieve pending count', 500, error.message));
  }
};

const approveSong = async (req, res) => {
  try {
    const { processingID } = req.params;
    const { note } = req.body;
    const userID = req.user.userID;

    if (!processingID) {
      return res.status(400).json(errorResponse('Processing ID is required', 400));
    }

    const result = await AdminSongsService.approveSong(processingID, userID, note);

    return res.json(successResponse('Song approved successfully', result));
  } catch (error) {
    logger.error('Error in approveSong:', error);
    
    if (error.message === 'Processing not found') {
      return res.status(404).json(errorResponse(error.message, 404));
    }

    return res.status(500).json(errorResponse('Failed to approve song', 500, error.message));
  }
};

const rejectSong = async (req, res) => {
  try {
    const { processingID } = req.params;
    const { note } = req.body;
    const userID = req.user.userID;

    if (!processingID) {
      return res.status(400).json(errorResponse('Processing ID is required', 400));
    }

    const result = await AdminSongsService.rejectSong(processingID, userID, note);

    return res.json(successResponse('Song rejected successfully', result));
  } catch (error) {
    logger.error('Error in rejectSong:', error);
    
    if (error.message === 'Processing not found') {
      return res.status(404).json(errorResponse(error.message, 404));
    }

    return res.status(500).json(errorResponse('Failed to reject song', 500, error.message));
  }
};

const bulkApprove = async (req, res) => {
  try {
    const { processingIDs, note } = req.body;
    const userID = req.user.userID;

    if (!Array.isArray(processingIDs) || processingIDs.length === 0) {
      return res.status(400).json(errorResponse('Processing IDs array is required', 400));
    }

    const result = await AdminSongsService.bulkApprove(processingIDs, userID, note);

    return res.json(successResponse(`${result.approved} song(s) approved successfully`, result));
  } catch (error) {
    logger.error('Error in bulkApprove:', error);
    return res.status(500).json(errorResponse('Failed to approve songs', 500, error.message));
  }
};

const bulkReject = async (req, res) => {
  try {
    const { processingIDs, note } = req.body;
    const userID = req.user.userID;

    if (!Array.isArray(processingIDs) || processingIDs.length === 0) {
      return res.status(400).json(errorResponse('Processing IDs array is required', 400));
    }

    const result = await AdminSongsService.bulkReject(processingIDs, userID, note);

    return res.json(successResponse(`${result.rejected} song(s) rejected successfully`, result));
  } catch (error) {
    logger.error('Error in bulkReject:', error);
    return res.status(500).json(errorResponse('Failed to reject songs', 500, error.message));
  }
};

const updateLyrics = async (req, res) => {
  try {
    const { processingID } = req.params;
    const { lyrics } = req.body;
    const userID = req.user.userID;

    if (!processingID) {
      return res.status(400).json(errorResponse('Processing ID is required', 400));
    }

    if (!lyrics || typeof lyrics !== 'string') {
      return res.status(400).json(errorResponse('Lyrics must be a non-empty string', 400));
    }

    const result = await AdminSongsService.updateSongLyrics(processingID, lyrics, userID);

    return res.json(successResponse('Lyrics updated successfully', result));
  } catch (error) {
    logger.error('Error in updateLyrics:', error);
    return res.status(500).json(errorResponse('Failed to update lyrics', 500, error.message));
  }
};

module.exports = {
  getSongs,
  getPendingCount,
  approveSong,
  rejectSong,
  bulkApprove,
  bulkReject,
  updateLyrics
};

