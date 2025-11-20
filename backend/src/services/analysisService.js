const DatabaseService = require('./databaseService');
const TranslateService = require('./translateService');
const lyricsService = require('./lyricsService');
const { logger } = require('../middleware/logger');

// Mood Class Mapping (from n8n AI model)
const MOOD_CLASS_MAP = {
  0: 'Happy',
  1: 'Sad',
  2: 'Anger',
  3: 'Disgust',
  4: 'Fear',
  5: 'Fear',
  6: 'Surprise',
  7: 'Sleepy',
  8: 'Playful',
  9: 'Love',
  10: 'Calm',
  11: 'Neutral',
  12: 'Sick',
  13: 'Embarrassed',
  14: 'Dizzy',
  15: 'Broken Heart',
  16: 'Cool',
  17: 'Mixed',
  18: 'Awkward',
  19: 'Wink',
  20: 'Hearts',
  21: 'Angel'
};

class AnalysisService {
  
  static async validateUserId(userId) {
    if (!userId) {
      return null;
    }
    
    try {
      const userCheckQuery = `SELECT userid FROM users WHERE userid = $1 LIMIT 1`;
      const userCheckResult = await DatabaseService.query(userCheckQuery, [userId]);
      if (userCheckResult.rows && userCheckResult.rows.length > 0) {
        return userId;
      } else {
        logger.warn(`UserId ${userId} not found in Users table, using NULL for createdBy`);
        return null;
      }
    } catch (error) {
      logger.error(`Error validating userId ${userId}:`, error);
      return null;
    }
  }
  static async process(lyricsRecord, actions, translationConfig, userId = null, shareRequest = false) {
    try {
      let lyricsResult = await this.ensureLyricsSearchResult(lyricsRecord);
      let song = await this.ensureSong(lyricsRecord, lyricsResult, userId);
      
      const targetLanguage = translationConfig?.targetLanguage || null;
      
      if (targetLanguage && actions.translate) {
        const languageCodeToName = {
          'en': 'English',
          'th': 'Thai',
          'lo': 'Lao',
          'ko': 'Korean',
          'ja': 'Japanese',
          'zh': 'Chinese',
          'es': 'Spanish',
          'fr': 'French',
          'de': 'German',
          'it': 'Italian',
          'pt': 'Portuguese',
          'ru': 'Russian',
          'vi': 'Vietnamese',
          'id': 'Indonesian',
          'ms': 'Malay',
          'hi': 'Hindi'
        };

        const languageName = languageCodeToName[targetLanguage] || targetLanguage;

        const existingProcessingQuery = `
          SELECT processingid, songid, status, approvalstatus, sharestatus, targetlanguage
          FROM songaiprocessing
          WHERE songid = $1
            AND approvalstatus = 'approved'
            AND sharestatus = 'public_approved'
            AND targetlanguage = $2
          ORDER BY 
            CASE WHEN totalratings > 0 THEN 0 ELSE 1 END,
            totalratings DESC,
            averagerating DESC NULLS LAST,
            createdat DESC
          LIMIT 1
        `;
        const existingProcessingResult = await DatabaseService.query(existingProcessingQuery, [song.songID, languageName]);
        
        if (existingProcessingResult.rows && existingProcessingResult.rows.length > 0) {
          const existingProcessing = existingProcessingResult.rows[0];
          logger.info(`Song already exists with approved processing for target language ${targetLanguage}: ${existingProcessing.processingid}`);
          return {
            processingID: String(existingProcessing.processingid),
            songID: String(song.songID),
            status: 'completed',
            alreadyExists: true,
            message: 'Song already exists in system with approved processing'
          };
        }
      }
      
      // Validate userId exists in Users table if provided
      const validUserId = await this.validateUserId(userId);
      
      const shareStatus = shareRequest ? 'public_pending' : 'private';
      const approvalStatus = shareRequest ? 'pending' : null;
      const processingInsertQuery = `
        INSERT INTO songaiprocessing 
        (songid, aimodel, status, createdby, sharestatus, approvalstatus) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
      `;
      const processingInsertResult = await DatabaseService.query(processingInsertQuery, [
        song.songID,
        'n8n-translate',
        'processing',
        validUserId,
        shareStatus,
        approvalStatus
      ]);
      const processingRaw = processingInsertResult.rows[0];
      const processing = {
        processingID: processingRaw.processingid,
        songID: song.songID,
        aiModel: processingRaw.aimodel,
        status: processingRaw.status,
        createdBy: processingRaw.createdby
      };

      await this.applyProcessingMetadata(processing.processingID, {
        coverImage: lyricsRecord.coverImage,
        youtubeVideoId: lyricsRecord.youtubeVideoId
      });
      
      if (!processing.processingID) {
        throw new Error('Failed to create processing record: processingID is missing');
      }
      if (!song.songID) {
        throw new Error('Failed to get song record: songID is missing');
      }
      
      const startTime = Date.now();
      let translationResult = null;
      let moodResult = null;
      
      let fullLyrics = null;
      if (actions.translate || actions.mood) {
        fullLyrics = await this.fetchFullLyrics(
          lyricsRecord.plainLyrics || lyricsRecord.lyrics,
          lyricsResult.externalID,
          { source: lyricsRecord.source || lyricsRecord.sourceAPI || lyricsResult.sourceAPI }
        );
      }
      
      if (actions.translate) {
        // Pass moodEnabled to processTranslation if mood is requested
        const moodEnabled = actions.mood ? true : null;
        translationResult = await this.processTranslation(
          fullLyrics,
          translationConfig,
          processing.processingID,
          moodEnabled,
          4 // moodTopK default to 4
        );
        logger.info('Translation result received:', {
          hasTranslation: !!translationResult?.translation,
          hasInterpretation: !!translationResult?.interpretation,
          hasSummary: !!translationResult?.summary,
          hasMood: !!translationResult?.mood,
          interpretationLength: translationResult?.interpretation?.length || 0,
          summaryLength: translationResult?.summary?.length || 0
        });
      }
      
      // Mood analysis is now handled by n8n webhook if translate is enabled
      // If only mood is requested without translate, we still need to handle it separately
      if (actions.mood && !actions.translate) {
        // If mood is requested but no translate, we can't use n8n mood analysis
        // This case should be handled separately if needed
        logger.warn('Mood analysis without translation is not supported. Please enable translation for mood analysis.');
        throw new Error('Mood analysis requires translation to be enabled');
      }
      
      // Mood result is extracted from translation result if available
      if (actions.mood && translationResult && translationResult.mood) {
        moodResult = translationResult.mood;
      }
      
      const processingTime = Date.now() - startTime;
      
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;
      
      updateFields.push(`processingtime = $${paramIndex++}`);
      updateValues.push(processingTime);
      
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push('completed');
      
      if (translationResult) {
        const mappedTranslation = this.mapTranslationToPreview(translationResult.translation);
        updateFields.push(`translation = $${paramIndex++}`);
        updateValues.push(mappedTranslation);
        
        updateFields.push(`interpretation = $${paramIndex++}`);
        updateValues.push(translationResult.interpretation);
        
        if (translationConfig && translationConfig.originalLanguage != null) {
          updateFields.push(`originallanguage = $${paramIndex++}`);
          updateValues.push(translationConfig.originalLanguage);
        }
        
        if (translationConfig && translationConfig.targetLanguage != null) {
          updateFields.push(`targetlanguage = $${paramIndex++}`);
          updateValues.push(translationConfig.targetLanguage);
        }
        
        updateFields.push(`translationconfidence = $${paramIndex++}`);
        updateValues.push(0.95);
      }
      
      if (moodResult) {
        updateFields.push(`moodtype = $${paramIndex++}`);
        updateValues.push(JSON.stringify(moodResult.moods));
        
        updateFields.push(`moodscore = $${paramIndex++}`);
        updateValues.push(moodResult.topScore || 0.00);
        
        updateFields.push(`moodconfidence = $${paramIndex++}`);
        updateValues.push(moodResult.confidence || 0.0);
      }
      
      const requestedActions = [];
      if (actions.translate && translationResult) requestedActions.push('translate');
      if (actions.mood && moodResult) requestedActions.push('mood');
      updateFields.push(`iscompleteprocessing = $${paramIndex++}`);
      updateValues.push(requestedActions.length > 0);
      
      const whereValueIndex = paramIndex;
      updateValues.push(processing.processingID);
      
      const updateQuery = `
        UPDATE songaiprocessing 
        SET ${updateFields.join(', ')} 
        WHERE processingid = $${whereValueIndex}
      `;
      await DatabaseService.query(updateQuery, updateValues);
      
      if (!processing.processingID || !song.songID) {
        logger.error('Missing IDs in result:', { processingID: processing.processingID, songID: song.songID });
        throw new Error('Failed to complete analysis: missing IDs');
      }
      
      return {
        processingID: String(processing.processingID),
        songID: String(song.songID),
        status: 'completed',
        translation: translationResult ? {
          text: translationResult.translation,
          interpretation: translationResult.interpretation,
          originalLanguage: translationConfig.originalLanguage ?? null,
          targetLanguage: translationConfig.targetLanguage ?? null
        } : null,
        mood: moodResult
      };
      
    } catch (error) {
      logger.error('Error in AnalysisService.process:', error);
      throw error;
    }
  }

  static async processNew(lyricsRecord, actions, translationConfig, userId = null, shareRequest = false) {
    try {
      let lyricsResult = await this.ensureLyricsSearchResult(lyricsRecord);
      let song = await this.ensureSong(lyricsRecord, lyricsResult, userId);
      
      // Skip existing check - always create new analysis
      
      // Validate userId exists in Users table if provided
      const validUserId = await this.validateUserId(userId);
      
      const shareStatus = shareRequest ? 'public_pending' : 'private';
      const approvalStatus = shareRequest ? 'pending' : null;
      const processingInsertQuery = `
        INSERT INTO songaiprocessing 
        (songid, aimodel, status, createdby, sharestatus, approvalstatus) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
      `;
      const processingInsertResult = await DatabaseService.query(processingInsertQuery, [
        song.songID,
        'n8n-translate',
        'processing',
        validUserId,
        shareStatus,
        approvalStatus
      ]);
      const processingRaw = processingInsertResult.rows[0];
      const processing = {
        processingID: processingRaw.processingid,
        songID: song.songID,
        aiModel: processingRaw.aimodel,
        status: processingRaw.status,
        createdBy: processingRaw.createdby
      };

      await this.applyProcessingMetadata(processing.processingID, {
        coverImage: lyricsRecord.coverImage,
        youtubeVideoId: lyricsRecord.youtubeVideoId
      });
      
      if (!processing.processingID) {
        throw new Error('Failed to create processing record: processingID is missing');
      }
      if (!song.songID) {
        throw new Error('Failed to get song record: songID is missing');
      }
      
      const startTime = Date.now();
      let translationResult = null;
      let moodResult = null;
      
      let fullLyrics = null;
      if (actions.translate || actions.mood) {
        fullLyrics = await this.fetchFullLyrics(
          lyricsRecord.plainLyrics || lyricsRecord.lyrics,
          lyricsResult.externalID,
          { source: lyricsRecord.source || lyricsRecord.sourceAPI || lyricsResult.sourceAPI }
        );
      }
      
      if (actions.translate) {
        // Pass moodEnabled to processTranslation if mood is requested
        const moodEnabled = actions.mood ? true : null;
        translationResult = await this.processTranslation(
          fullLyrics,
          translationConfig,
          processing.processingID,
          moodEnabled,
          4 // moodTopK default to 4
        );
        logger.info('Translation result received:', {
          hasTranslation: !!translationResult?.translation,
          hasInterpretation: !!translationResult?.interpretation,
          hasSummary: !!translationResult?.summary,
          hasMood: !!translationResult?.mood,
          interpretationLength: translationResult?.interpretation?.length || 0,
          summaryLength: translationResult?.summary?.length || 0
        });
      }
      
      // Mood analysis is now handled by n8n webhook if translate is enabled
      // If only mood is requested without translate, we still need to handle it separately
      if (actions.mood && !actions.translate) {
        // If mood is requested but no translate, we can't use n8n mood analysis
        // This case should be handled separately if needed
        logger.warn('Mood analysis without translation is not supported. Please enable translation for mood analysis.');
        throw new Error('Mood analysis requires translation to be enabled');
      }
      
      // Mood result is extracted from translation result if available
      if (actions.mood && translationResult && translationResult.mood) {
        moodResult = translationResult.mood;
      }
      
      const processingTime = Date.now() - startTime;
      
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;
      
      updateFields.push(`processingtime = $${paramIndex++}`);
      updateValues.push(processingTime);
      
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push('completed');
      
      if (translationResult) {
        const mappedTranslation = this.mapTranslationToPreview(translationResult.translation);
        updateFields.push(`translation = $${paramIndex++}`);
        updateValues.push(mappedTranslation);
        
        updateFields.push(`interpretation = $${paramIndex++}`);
        updateValues.push(translationResult.interpretation);
        
        if (translationConfig && translationConfig.originalLanguage != null) {
          updateFields.push(`originallanguage = $${paramIndex++}`);
          updateValues.push(translationConfig.originalLanguage);
        }
        
        if (translationConfig && translationConfig.targetLanguage != null) {
          updateFields.push(`targetlanguage = $${paramIndex++}`);
          updateValues.push(translationConfig.targetLanguage);
        }
        
        updateFields.push(`translationconfidence = $${paramIndex++}`);
        updateValues.push(0.95);
      }
      
      if (moodResult) {
        updateFields.push(`moodtype = $${paramIndex++}`);
        updateValues.push(JSON.stringify(moodResult.moods));
        
        updateFields.push(`moodscore = $${paramIndex++}`);
        updateValues.push(moodResult.topScore || 0.00);
        
        updateFields.push(`moodconfidence = $${paramIndex++}`);
        updateValues.push(moodResult.confidence || 0.0);
      }
      
      const requestedActions = [];
      if (actions.translate && translationResult) requestedActions.push('translate');
      if (actions.mood && moodResult) requestedActions.push('mood');
      updateFields.push(`iscompleteprocessing = $${paramIndex++}`);
      updateValues.push(requestedActions.length > 0);
      
      const whereValueIndex = paramIndex;
      updateValues.push(processing.processingID);
      
      const updateQuery = `
        UPDATE songaiprocessing 
        SET ${updateFields.join(', ')} 
        WHERE processingid = $${whereValueIndex}
      `;
      await DatabaseService.query(updateQuery, updateValues);
      
      if (!processing.processingID || !song.songID) {
        logger.error('Missing IDs in result:', { processingID: processing.processingID, songID: song.songID });
        throw new Error('Failed to complete analysis: missing IDs');
      }
      
      return {
        processingID: String(processing.processingID),
        songID: String(song.songID),
        status: 'completed',
        translation: translationResult ? {
          text: translationResult.translation,
          interpretation: translationResult.interpretation,
          originalLanguage: translationConfig.originalLanguage ?? null,
          targetLanguage: translationConfig.targetLanguage ?? null
        } : null,
        mood: moodResult
      };
      
    } catch (error) {
      logger.error('Error in AnalysisService.processNew:', error);
      throw error;
    }
  }

  static async reAnalyze(processingID, actions, translationConfig) {
    try {
      if (!processingID) {
        throw new Error('processingID is required');
      }

      const processingQuery = `
        SELECT sap.*, s.songname, s.artistname, s.lyrics, s.duration, s.lyricssearchresultid,
               lsr.externalid, lsr.trackname
        FROM songaiprocessing sap
        JOIN songs s ON sap.songid = s.songid
        LEFT JOIN lyricssearchresults lsr ON s.lyricssearchresultid = lsr.lyricssearchresultid
        WHERE sap.processingid = $1
        LIMIT 1
      `;
      const processingResult = await DatabaseService.query(processingQuery, [processingID]);

      if (!processingResult.rows || processingResult.rows.length === 0) {
        throw new Error('Processing record not found');
      }

      const processingRaw = processingResult.rows[0];
      const song = {
        songID: processingRaw.songid,
        songName: processingRaw.songname,
        artistName: processingRaw.artistname,
        lyrics: processingRaw.lyrics,
        duration: processingRaw.duration,
        lyricsSearchResultID: processingRaw.lyricssearchresultid
      };

      const lyricsRecord = {
        id: processingRaw.externalid,
        songID: song.songID,
        trackName: processingRaw.trackname || song.songName,
        artistName: song.artistName,
        plainLyrics: song.lyrics,
        duration: song.duration
      };

      const updateStatusQuery = `
        UPDATE songaiprocessing 
        SET status = 'processing', updatedat = CURRENT_TIMESTAMP
        WHERE processingid = $1
      `;
      await DatabaseService.query(updateStatusQuery, [processingID]);

      let lyricsResult = await this.ensureLyricsSearchResult(lyricsRecord);

      const existingOriginalLanguage = processingRaw.originallanguage || null;
      const finalTranslationConfig = {
        ...translationConfig,
        originalLanguage: translationConfig.originalLanguage ?? existingOriginalLanguage ?? null
      };

      const startTime = Date.now();
      let translationResult = null;
      let moodResult = null;

      let fullLyrics = null;
      if (actions.translate || actions.mood) {
        fullLyrics = await this.fetchFullLyrics(
          lyricsRecord.plainLyrics || lyricsRecord.lyrics,
          lyricsResult.externalID,
          { source: lyricsRecord.source || lyricsRecord.sourceAPI || lyricsResult.sourceAPI }
        );
      }

      if (actions.translate) {
        // Pass moodEnabled to processTranslation if mood is requested
        const moodEnabled = actions.mood ? true : null;
        translationResult = await this.processTranslation(
          fullLyrics,
          finalTranslationConfig,
          processingID,
          moodEnabled,
          4 // moodTopK default to 4
        );
        logger.info('Translation result received (reAnalyze):', {
          hasTranslation: !!translationResult?.translation,
          hasInterpretation: !!translationResult?.interpretation,
          hasSummary: !!translationResult?.summary,
          hasMood: !!translationResult?.mood,
          interpretationLength: translationResult?.interpretation?.length || 0,
          summaryLength: translationResult?.summary?.length || 0
        });
      }

      // Mood analysis is now handled by n8n webhook if translate is enabled
      if (actions.mood && !actions.translate) {
        logger.warn('Mood analysis without translation is not supported. Please enable translation for mood analysis.');
        throw new Error('Mood analysis requires translation to be enabled');
      }
      
      // Mood result is extracted from translation result if available
      if (actions.mood && translationResult && translationResult.mood) {
        moodResult = translationResult.mood;
      }

      const processingTime = Date.now() - startTime;

      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      updateFields.push(`processingtime = $${paramIndex++}`);
      updateValues.push(processingTime);

      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push('completed');

      if (translationResult) {
        const mappedTranslation = this.mapTranslationToPreview(translationResult.translation);
        updateFields.push(`translation = $${paramIndex++}`);
        updateValues.push(mappedTranslation);

        updateFields.push(`interpretation = $${paramIndex++}`);
        updateValues.push(translationResult.interpretation);

        if (finalTranslationConfig.originalLanguage != null) {
          updateFields.push(`originallanguage = $${paramIndex++}`);
          updateValues.push(finalTranslationConfig.originalLanguage);
        }

        if (finalTranslationConfig.targetLanguage != null) {
          updateFields.push(`targetlanguage = $${paramIndex++}`);
          updateValues.push(finalTranslationConfig.targetLanguage);
        }

        updateFields.push(`translationconfidence = $${paramIndex++}`);
        updateValues.push(0.95);
      }

      if (moodResult) {
        updateFields.push(`moodtype = $${paramIndex++}`);
        updateValues.push(JSON.stringify(moodResult.moods));

        updateFields.push(`moodscore = $${paramIndex++}`);
        updateValues.push(moodResult.topScore || 0.00);

        updateFields.push(`moodconfidence = $${paramIndex++}`);
        updateValues.push(moodResult.confidence || 0.0);
      }

      const requestedActions = [];
      if (actions.translate && translationResult) requestedActions.push('translate');
      if (actions.mood && moodResult) requestedActions.push('mood');
      updateFields.push(`iscompleteprocessing = $${paramIndex++}`);
      updateValues.push(requestedActions.length > 0);

      const whereValueIndex = paramIndex;
      updateValues.push(processingID);

      const updateQuery = `
        UPDATE songaiprocessing 
        SET ${updateFields.join(', ')}, updatedat = CURRENT_TIMESTAMP
        WHERE processingid = $${whereValueIndex}
      `;
      await DatabaseService.query(updateQuery, updateValues);

      return {
        processingID: String(processingID),
        songID: String(song.songID),
        status: 'completed',
        translation: translationResult ? {
          text: translationResult.translation,
          interpretation: translationResult.interpretation,
          originalLanguage: finalTranslationConfig.originalLanguage ?? null,
          targetLanguage: finalTranslationConfig.targetLanguage ?? null
        } : null,
        mood: moodResult
      };

    } catch (error) {
      logger.error('Error in AnalysisService.reAnalyze:', error);
      
      const updateStatusQuery = `
        UPDATE songaiprocessing 
        SET status = 'failed', errormessage = $1, updatedat = CURRENT_TIMESTAMP
        WHERE processingid = $2
      `;
      await DatabaseService.query(updateStatusQuery, [error.message, processingID]).catch(err => {
        logger.error('Failed to update processing status to failed:', err);
      });

      throw error;
    }
  }
  
  static async ensureLyricsSearchResult(lyricsRecord) {
    if (!lyricsRecord) {
      throw new Error('Lyrics record is required');
    }
    
    const normalizeResult = (row) => ({
      lyricsSearchResultID: row.lyricssearchresultid,
      externalID: row.externalid,
      trackName: row.trackname,
      artistName: row.artistname,
      albumName: row.albumname,
      duration: row.duration,
      instrumental: row.instrumental,
      lyricsPreview: row.lyricspreview,
      sourceAPI: row.sourceapi,
      usageCount: row.usagecount,
      lastUsedAt: row.lastusedat,
      fetchedAt: row.fetchedat,
      createdAt: row.createdat,
      updatedAt: row.updatedat
    });
    
    if (!lyricsRecord.id) {
      if (!lyricsRecord.songID) {
        throw new Error('Lyrics record must have an id or songID');
      }
      const songQuery = `
        SELECT lyricssearchresultid 
        FROM songs 
        WHERE songid = $1
        LIMIT 1
      `;
      const songResult = await DatabaseService.query(songQuery, [lyricsRecord.songID]);
      if (!songResult.rows || songResult.rows.length === 0) {
        throw new Error(`Song not found for songID: ${lyricsRecord.songID}`);
      }
      const songRow = songResult.rows[0];
      if (!songRow.lyricssearchresultid) {
        throw new Error(`Song ${lyricsRecord.songID} is missing lyricsSearchResultID`);
      }
      const lyricsResultQuery = `
        SELECT *
        FROM lyricssearchresults
        WHERE lyricssearchresultid = $1
        LIMIT 1
      `;
      const lyricsResult = await DatabaseService.query(lyricsResultQuery, [songRow.lyricssearchresultid]);
      if (!lyricsResult.rows || lyricsResult.rows.length === 0) {
        throw new Error(`Lyrics search result not found for songID: ${lyricsRecord.songID}`);
      }
      return normalizeResult(lyricsResult.rows[0]);
    }
    
    const externalID = (lyricsRecord.id ?? '').toString().trim();
    if (!externalID) {
      throw new Error('Lyrics record must have an id or songID');
    }

    const sourceAPI = lyricsRecord.source || lyricsRecord.sourceAPI || 'lrclib';
    
    const findQuery = `SELECT * FROM lyricssearchresults WHERE externalid = $1 LIMIT 1`;
    const findResult = await DatabaseService.query(findQuery, [externalID]);
    const existing = findResult.rows[0] || null;
    
    if (existing) {
      return normalizeResult(existing);
    }
    
    let duration = null;
    if (lyricsRecord.duration != null) {
      duration = parseInt(String(lyricsRecord.duration), 10);
      if (isNaN(duration)) {
        duration = null;
      }
    }
    
    const fullLyricsText = lyricsRecord.plainLyrics || lyricsRecord.lyrics || '';
    const lyricsPreview = lyricsRecord.lyricsPreview || fullLyricsText
      .split('\n')[0]
      .substring(0, 500)
      .trim();
    
    const insertQuery = `
      INSERT INTO lyricssearchresults 
      (externalid, trackname, artistname, albumname, duration, instrumental, lyricspreview, sourceapi) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;
    const insertValues = [
      externalID,
      lyricsRecord.trackName || lyricsRecord.songName || '',
      lyricsRecord.artistName || '',
      lyricsRecord.albumName || '',
      duration,
      lyricsRecord.instrumental || false,
      lyricsPreview,
      sourceAPI
    ];
    const insertResult = await DatabaseService.query(insertQuery, insertValues);
    const newResult = insertResult.rows[0];
    
    const normalizedResult = {
      lyricsSearchResultID: newResult.lyricssearchresultid,
      externalID: newResult.externalid,
      trackName: newResult.trackname,
      artistName: newResult.artistname,
      albumName: newResult.albumname,
      duration: newResult.duration,
      instrumental: newResult.instrumental,
      lyricsPreview: newResult.lyricspreview,
      sourceAPI: newResult.sourceapi,
      usageCount: newResult.usagecount,
      lastUsedAt: newResult.lastusedat,
      fetchedAt: newResult.fetchedat,
      createdAt: newResult.createdat,
      updatedAt: newResult.updatedat
    };
    
    logger.info(`Created new LyricsSearchResult: ${normalizedResult.lyricsSearchResultID}`);
    return normalizedResult;
  }
  
  static async fetchFullLyrics(lyricsFromRecord, externalID, options = {}) {
    const source = options.source || null;
    
    if (lyricsFromRecord && lyricsFromRecord.trim()) {
      return lyricsFromRecord;
    }
    
    if (!externalID) {
      if (source === 'youtube') {
        logger.warn('Missing lyrics text for YouTube source; returning empty lyrics.');
        return '';
      }
      throw new Error('Cannot fetch lyrics: externalID is missing');
    }
    
    if (source === 'youtube') {
      logger.info('Skipping external lyrics fetch for YouTube source', { externalID });
      return '';
    }
    
    try {
      logger.info(`Fetching full lyrics from external API for externalID: ${externalID}`);
      const result = await lyricsService.getById(externalID);
      
      if (!result || !result.plainLyrics) {
        throw new Error('Failed to fetch lyrics from external API: no lyrics found');
      }
      
      return result.plainLyrics;
    } catch (error) {
      logger.error(`Failed to fetch lyrics from external API (externalID: ${externalID}):`, error);
      throw new Error(`Failed to fetch lyrics: ${error.message}`);
    }
  }
  
  static async ensureSong(lyricsRecord, lyricsResult, userId) {
    if (!lyricsResult || !lyricsResult.lyricsSearchResultID) {
      throw new Error('LyricsSearchResult must have lyricsSearchResultID');
    }
    
    const songQuery = `
      SELECT * FROM songs 
      WHERE lyricssearchresultid = $1 
      LIMIT 1
    `;
    const songResult = await DatabaseService.query(songQuery, [lyricsResult.lyricsSearchResultID]);
    const existingSong = songResult.rows[0] || null;
    
    if (existingSong) {
      // Do not store synced lyrics from external sources; fetch on demand instead
      return {
        songID: existingSong.songid,
        songName: existingSong.songname,
        artistName: existingSong.artistname,
        genre: existingSong.genre,
        lyrics: existingSong.lyrics, // Will be null for external sources, fetched on demand
        syncedLyrics: existingSong.syncedlyrics,
        duration: existingSong.duration,
        filePath: existingSong.filepath,
        isActive: existingSong.isactive,
        approved: existingSong.approved,
        approvedBy: existingSong.approvedby,
        playCount: existingSong.playcount,
        popularity: existingSong.popularity,
        lyricsSearchResultID: existingSong.lyricssearchresultid,
        sourceStatus: existingSong.sourcestatus,
        createdBy: existingSong.createdby,
        updatedBy: existingSong.updatedby,
        createdAt: existingSong.createdat,
        updatedAt: existingSong.updatedat
      };
    }
    
    // Validate userId exists in Users table if provided
    const validUserId = await this.validateUserId(userId);
    
    let songDuration = null;
    if (lyricsRecord.duration != null) {
      songDuration = parseInt(String(lyricsRecord.duration), 10);
      if (isNaN(songDuration)) {
        songDuration = null;
      }
    }
    
    const sourceStatus = lyricsRecord.sourceStatus
      || (lyricsResult.sourceAPI === 'youtube' ? 'external' : 'from_lyrics_search');

    // For external sources (lrclib, youtube), don't store full lyrics or synced lyrics in Songs table
    const isExternalSource = lyricsResult.sourceAPI === 'youtube' || lyricsResult.sourceAPI === 'lrclib';
    const storeLyrics = isExternalSource ? null : (lyricsRecord.plainLyrics || lyricsRecord.lyrics || null);
    
    const songInsertQuery = `
      INSERT INTO songs 
      (songname, artistname, genre, lyrics, duration, filepath, lyricssearchresultid, sourcestatus, createdby, syncedlyrics) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `;
    const songInsertValues = [
      lyricsRecord.trackName || lyricsRecord.songName || '',
      lyricsRecord.artistName || '',
      null,
      storeLyrics,
      songDuration,
      null,
      lyricsResult.lyricsSearchResultID,
      sourceStatus,
      validUserId,
      null
    ];
    const songInsertResult = await DatabaseService.query(songInsertQuery, songInsertValues);
    const newSong = songInsertResult.rows[0];
    
    const normalizedSong = {
      songID: newSong.songid,
      songName: newSong.songname,
      artistName: newSong.artistname,
      genre: newSong.genre,
      lyrics: newSong.lyrics,
      duration: newSong.duration,
      filePath: newSong.filepath,
      isActive: newSong.isactive,
      approved: newSong.approved,
      approvedBy: newSong.approvedby,
      playCount: newSong.playcount,
      popularity: newSong.popularity,
      lyricsSearchResultID: newSong.lyricssearchresultid,
      sourceStatus: newSong.sourcestatus,
      syncedLyrics: newSong.syncedlyrics,
      createdBy: newSong.createdby,
      updatedBy: newSong.updatedby,
      createdAt: newSong.createdat,
      updatedAt: newSong.updatedat
    };
    
    logger.info(`Created new Song: ${normalizedSong.songID}`);
    return normalizedSong;
  }
  
  static mapTranslationToPreview(translationText) {
    if (!translationText || !translationText.trim()) {
      return translationText;
    }

    let cleanedText = translationText.trim();

    cleanedText = cleanedText.replace(/^```[\w]*\s*\n?/m, '');
    cleanedText = cleanedText.replace(/```\s*$/m, '');
    cleanedText = cleanedText.replace(/\\n/g, '\n');

    // Remove trailing separators such as "---" or multiple blank lines
    cleanedText = cleanedText.replace(/\n+---\s*$/m, '');
    cleanedText = cleanedText.replace(/\n{2,}$/m, '\n');
    cleanedText = cleanedText.trimEnd();

    // Parse into pairs and truncate original lines to 10 characters (code points)
    const lines = cleanedText.split('\n');
    const result = [];
    const MAX_CHARS_ORIGINAL = 10;
    
    let i = 0;
    while (i < lines.length) {
      const line1 = lines[i]?.trim() || '';
      const line2 = lines[i + 1]?.trim() || '';
      
      if (!line1 && !line2) {
        i++;
        continue;
      }
      
      // Truncate original line to first N characters (code points) to support multi-language
      let originalLine = line1;
      if (originalLine) {
        const chars = Array.from(originalLine);
        if (chars.length > MAX_CHARS_ORIGINAL) {
          originalLine = chars.slice(0, MAX_CHARS_ORIGINAL).join('').trim();
        }
      }
      
      if (originalLine) {
        result.push(originalLine);
        if (line2) {
          result.push(line2);
        }
        result.push('');
        i += 2;
      } else if (line2) {
        // If no original, just add translation
        result.push(line2);
        result.push('');
        i += 2;
      } else {
        i++;
      }
      
      // Skip empty lines
      while (i < lines.length && !lines[i]?.trim()) {
        i++;
      }
    }
    
    // Remove trailing empty lines
    while (result.length > 0 && result[result.length - 1] === '') {
      result.pop();
    }
    
    return result.join('\n');
  }
  
  static parseMoodFromText(moodText) {
    if (!moodText || typeof moodText !== 'string') {
      return null;
    }

    // Remove "MoodAnalyze:" prefix if present (case insensitive)
    let cleanText = moodText.trim();
    if (cleanText.toLowerCase().startsWith('moodanalyze:')) {
      cleanText = cleanText.substring(12).trim();
    }

    // Split by newline and filter empty lines
    const moodLines = cleanText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const moodItems = [];

    logger.debug('Parsing mood lines:', { 
      originalText: moodText.substring(0, 100),
      cleanText: cleanText.substring(0, 100),
      moodLines, 
      count: moodLines.length 
    });

    for (const line of moodLines) {
      // Match format: "1 40%" or "17 27%" etc. (with optional whitespace)
      const match = line.trim().match(/^(\d+)\s+(\d+)%$/);
      if (match) {
        const classIndex = parseInt(match[1], 10);
        const percentage = parseFloat(match[2]);
        
        if (!isNaN(classIndex) && !isNaN(percentage) && MOOD_CLASS_MAP[classIndex]) {
          moodItems.push({
            type: MOOD_CLASS_MAP[classIndex],
            percentage: percentage
          });
          logger.debug('Parsed mood item:', { classIndex, type: MOOD_CLASS_MAP[classIndex], percentage });
        } else {
          logger.warn('Invalid mood line or unknown class index:', { line, classIndex, percentage });
        }
      } else {
        logger.warn('Mood line format mismatch:', { line });
      }
    }

    // Sort by percentage descending (should already be sorted, but ensure it)
    moodItems.sort((a, b) => b.percentage - a.percentage);

    if (moodItems.length === 0) {
      logger.warn('No valid mood items parsed from text');
      return null;
    }

    const topMood = moodItems[0];
    const totalScore = moodItems.reduce((sum, item) => sum + item.percentage / 100, 0);
    const confidence = Math.min(totalScore, 1.0);

    logger.info('Successfully parsed mood from text:', {
      moodsCount: moodItems.length,
      topMood: topMood.type,
      topPercentage: topMood.percentage,
      allMoods: moodItems.map(m => `${m.type}: ${m.percentage}%`)
    });

    return {
      moods: moodItems,
      topMood: topMood.type,
      topScore: topMood.percentage / 100,
      confidence: confidence
    };
  }

  static async processTranslation(lyrics, translationConfig, processingID, moodEnabled = null, moodTopK = 4) {
    if (!lyrics) {
      throw new Error('Lyrics text is required for translation');
    }
    
    const originalLanguage = translationConfig.originalLanguage ?? null;
    const targetLanguage = translationConfig.targetLanguage ?? null;
    
    logger.info(`Processing translation for processingID: ${processingID}`, {
      originalLanguage,
      targetLanguage,
      lyricsLength: lyrics.length,
      moodEnabled: moodEnabled !== null && moodEnabled !== undefined ? moodEnabled : null,
      moodTopK: moodEnabled !== null && moodEnabled !== undefined ? moodTopK : null
    });
    
    const result = await TranslateService.getTranslate(
      originalLanguage ?? 'auto',
      targetLanguage ?? 'auto',
      lyrics,
      moodEnabled,
      moodTopK
    );
    
    if (!result.success || !result.data) {
      const errorMsg = result.error ? `${result.message}: ${result.error}` : result.message;
      logger.error('Translation failed:', { 
        processingID,
        error: result.error,
        message: result.message 
      });
      throw new Error(errorMsg || 'Translation failed');
    }
    
    let translated;
    if (Array.isArray(result.data)) {
      translated = result.data[0];
    } else if (typeof result.data === 'object' && result.data !== null) {
      translated = result.data;
    } else {
      throw new Error('Invalid translation result format');
    }
    
    // Parse mood from moodAnalyze field or interpretation if moodEnabled was true
    let moodResult = null;
    if (moodEnabled) {
      // Try to parse from moodAnalyze field first (preferred)
      if (translated.moodAnalyze) {
        logger.debug('Found moodAnalyze field in response');
        moodResult = this.parseMoodFromText(translated.moodAnalyze);
      }
      
      // Fallback to parsing from interpretation if moodAnalyze not found
      if (!moodResult && translated.interpretation) {
        logger.debug('No moodAnalyze field, trying to parse from interpretation');
        moodResult = this.parseMoodFromText(translated.interpretation);
      }
      
      if (moodResult) {
        logger.info('Mood analysis parsed from n8n response:', {
          source: translated.moodAnalyze ? 'moodAnalyze field' : 'interpretation field',
          moodsCount: moodResult.moods.length,
          topMood: moodResult.topMood,
          moods: moodResult.moods.map(m => `${m.type}: ${m.percentage}%`)
        });
      } else {
        logger.warn('Mood analysis was enabled but no mood data found in response', {
          hasMoodAnalyze: !!translated.moodAnalyze,
          hasInterpretation: !!translated.interpretation,
          moodAnalyzePreview: translated.moodAnalyze ? translated.moodAnalyze.substring(0, 100) : null
        });
      }
    }
    
    return {
      translation: translated.translation || '',
      interpretation: translated.interpretation || null,
      summary: translated.summary || null,
      mood: moodResult
    };
  }

  static async applyProcessingMetadata(processingID, metadata = {}) {
    if (!processingID) return;
    const updateFields = [];
    const values = [];

    if (metadata.coverImage) {
      updateFields.push(`coverimage = $${values.length + 1}`);
      values.push(metadata.coverImage);
    }

    if (metadata.youtubeVideoId) {
      updateFields.push(`youtubevideoid = $${values.length + 1}`);
      values.push(metadata.youtubeVideoId);
    }

    if (updateFields.length === 0) {
      return;
    }

    values.push(processingID);
    const query = `
      UPDATE songaiprocessing
      SET ${updateFields.join(', ')}, updatedat = CURRENT_TIMESTAMP
      WHERE processingid = $${values.length}
    `;
    await DatabaseService.query(query, values);
  }
}

module.exports = AnalysisService;

