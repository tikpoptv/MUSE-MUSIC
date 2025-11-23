const ProcessingService = require('../services/processingService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');
const JWTService = require('../services/jwtService');
const UserService = require('../services/userService');

const updateYouTubeVideoId = async (req, res) => {
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

    const { processingID } = req.params;
    const { youtubeVideoId } = req.body;

    if (!processingID || processingID === 'undefined') {
      return res.status(400).json(
        errorResponse('processingID is required', 400)
      );
    }

    if (youtubeVideoId && typeof youtubeVideoId !== 'string') {
      return res.status(400).json(
        errorResponse('youtubeVideoId must be a string', 400)
      );
    }

    logger.info('Updating YouTube video ID', {
      processingID,
      userId,
      hasVideoId: !!youtubeVideoId
    });

    const result = await ProcessingService.updateYouTubeVideoId(
      processingID,
      youtubeVideoId || null,
      userId
    );

    return res.json(
      successResponse('YouTube video ID updated successfully', result)
    );

  } catch (error) {
    logger.error('Error in updateYouTubeVideoId:', error);

    if (error.message.includes('required') || error.message.includes('not found')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to update YouTube video ID', 500, error.message)
    );
  }
};

const updateCoverImage = async (req, res) => {
  try {
    let userId = null;
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = JWTService.extractTokenFromHeader(authHeader);
      if (token) {
        const decoded = JWTService.verifyAccessToken(token);
        if (decoded && decoded.userID) {
          userId = decoded.userID;
          // ตรวจสอบว่า user เป็น admin หรือไม่
          try {
            const user = await UserService.findByID(userId);
            if (user) {
              const userRole = user.role?.toLowerCase();
              isAdmin = userRole === 'admin' || userRole === 'super_admin';
            }
          } catch (err) {
            // ถ้าไม่สามารถตรวจสอบได้ ให้ isAdmin = false
            logger.warn('Failed to check admin status:', err);
          }
        }
      }
    }

    const { processingID } = req.params;
    const { coverImageUrl } = req.body;

    if (!processingID || processingID === 'undefined') {
      return res.status(400).json(
        errorResponse('processingID is required', 400)
      );
    }

    if (coverImageUrl && typeof coverImageUrl !== 'string') {
      return res.status(400).json(
        errorResponse('coverImageUrl must be a string', 400)
      );
    }

    logger.info('Updating cover image', {
      processingID,
      userId,
      isAdmin,
      hasCoverImage: !!coverImageUrl
    });

    const result = await ProcessingService.updateCoverImage(
      processingID,
      coverImageUrl || null,
      userId,
      isAdmin
    );

    return res.json(
      successResponse('Cover image updated successfully', result)
    );

  } catch (error) {
    logger.error('Error in updateCoverImage:', error);

    if (error.message.includes('Cannot edit')) {
      return res.status(403).json(
        errorResponse(error.message, 403)
      );
    }

    if (error.message.includes('required') || error.message.includes('not found')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to update cover image', 500, error.message)
    );
  }
};

const updateSyncSettings = async (req, res) => {
  try {
    let userId = null;
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = JWTService.extractTokenFromHeader(authHeader);
      if (token) {
        const decoded = JWTService.verifyAccessToken(token);
        if (decoded && decoded.userID) {
          userId = decoded.userID;
          // ตรวจสอบว่า user เป็น admin หรือไม่
          try {
            const user = await UserService.findByID(userId);
            if (user) {
              const userRole = user.role?.toLowerCase();
              isAdmin = userRole === 'admin' || userRole === 'super_admin';
            }
          } catch (err) {
            // ถ้าไม่สามารถตรวจสอบได้ ให้ isAdmin = false
            logger.warn('Failed to check admin status:', err);
          }
        }
      }
    }

    const { processingID } = req.params;
    const { syncConfirmed, songStartTime } = req.body;

    if (!processingID || processingID === 'undefined') {
      return res.status(400).json(
        errorResponse('processingID is required', 400)
      );
    }

    if (typeof syncConfirmed !== 'boolean') {
      return res.status(400).json(
        errorResponse('syncConfirmed must be a boolean', 400)
      );
    }

    if (songStartTime !== null && songStartTime !== undefined && (typeof songStartTime !== 'number' || isNaN(songStartTime))) {
      return res.status(400).json(
        errorResponse('songStartTime must be a number or null', 400)
      );
    }

    logger.info('Updating sync settings', {
      processingID,
      userId,
      isAdmin,
      syncConfirmed,
      songStartTime
    });

    const result = await ProcessingService.updateSyncSettings(
      processingID,
      syncConfirmed,
      songStartTime || null,
      userId,
      isAdmin
    );

    return res.json(
      successResponse('Sync settings updated successfully', result)
    );

  } catch (error) {
    logger.error('Error in updateSyncSettings:', error);

    if (error.message.includes('Cannot edit')) {
      return res.status(403).json(
        errorResponse(error.message, 403)
      );
    }

    if (error.message.includes('required') || error.message.includes('not found') || error.message.includes('must be')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to update sync settings', 500, error.message)
    );
  }
};

module.exports = {
  updateYouTubeVideoId,
  updateCoverImage,
  updateSyncSettings
};

