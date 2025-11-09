const AnalysisService = require('../services/analysisService');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../middleware/logger');
const JWTService = require('../services/jwtService');

const startAnalysis = async (req, res) => {
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
    
    const { lyricsRecord, actions, translationConfig, shareRequest = false } = req.body;
    
    if (!lyricsRecord) {
      return res.status(400).json(
        errorResponse('lyricsRecord is required', 400)
      );
    }
    
    if (!actions || (typeof actions !== 'object')) {
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
    
    if (!lyricsRecord.id && !lyricsRecord.songID) {
      return res.status(400).json(
        errorResponse('lyricsRecord must have either id (external) or songID', 400)
      );
    }
    
    logger.info('Starting analysis', {
      userId,
      hasTranslate: actions.translate,
      hasMood: actions.mood,
      targetLanguage: translationConfig?.targetLanguage,
      shareRequest: shareRequest
    });
    
    const result = await AnalysisService.process(
      lyricsRecord,
      actions,
      translationConfig || {},
      userId,
      shareRequest
    );
    
    if (result.alreadyExists) {
      return res.json(
        successResponse('Song already exists in system with approved processing', result)
      );
    }
    
    return res.json(
      successResponse('Analysis completed successfully', result)
    );
    
  } catch (error) {
    logger.error('Error in startAnalysis:', error);
    
    if (error.message.includes('required') || error.message.includes('must')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }
    
    return res.status(500).json(
      errorResponse('Failed to process analysis', 500, error.message)
    );
  }
};

const reAnalyzeAnalysis = async (req, res) => {
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
    const { actions, translationConfig } = req.body;

    if (!processingID || processingID === 'undefined') {
      return res.status(400).json(
        errorResponse('processingID is required', 400)
      );
    }

    if (!actions || (typeof actions !== 'object')) {
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

    logger.info('Re-analyzing', {
      processingID,
      userId,
      hasTranslate: actions.translate,
      hasMood: actions.mood,
      targetLanguage: translationConfig?.targetLanguage
    });

    const result = await AnalysisService.reAnalyze(
      processingID,
      actions,
      translationConfig || {}
    );

    return res.json(
      successResponse('Re-analysis completed successfully', result)
    );

  } catch (error) {
    logger.error('Error in reAnalyzeAnalysis:', error);

    if (error.message.includes('required') || error.message.includes('must')) {
      return res.status(400).json(
        errorResponse(error.message, 400)
      );
    }

    if (error.message.includes('not found')) {
      return res.status(404).json(
        errorResponse(error.message, 404)
      );
    }

    return res.status(500).json(
      errorResponse('Failed to re-analyze', 500, error.message)
    );
  }
};

module.exports = {
  startAnalysis,
  reAnalyzeAnalysis
};

