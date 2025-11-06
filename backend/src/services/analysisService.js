const DatabaseService = require('./databaseService');
const TranslateService = require('./translateService');
const lyricsService = require('./lyricsService');
const { logger } = require('../middleware/logger');

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
      
      if (!processing.processingID) {
        throw new Error('Failed to create processing record: processingID is missing');
      }
      if (!song.songID) {
        throw new Error('Failed to get song record: songID is missing');
      }
      
      const startTime = Date.now();
      let translationResult = null;
      let moodResult = null;
      
      if (actions.translate) {
        const fullLyrics = await this.fetchFullLyrics(
          lyricsRecord.plainLyrics || lyricsRecord.lyrics,
          lyricsResult.externalID
        );
        
        translationResult = await this.processTranslation(
          fullLyrics,
          translationConfig,
          processing.processingID
        );
      }
      
      if (actions.mood) {
        moodResult = null;
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
        
        updateFields.push(`originallanguage = $${paramIndex++}`);
        updateValues.push(translationConfig.originalLanguage || 'auto');
        
        updateFields.push(`targetlanguage = $${paramIndex++}`);
        updateValues.push(translationConfig.targetLanguage);
        
        updateFields.push(`translationconfidence = $${paramIndex++}`);
        updateValues.push(0.95);
      }
      
      if (moodResult) {
        updateFields.push(`moodtype = $${paramIndex++}`);
        updateValues.push(moodResult.moodType || null);
        
        updateFields.push(`moodscore = $${paramIndex++}`);
        updateValues.push(moodResult.moodScore || 0.00);
        
        updateFields.push(`moodconfidence = $${paramIndex++}`);
        updateValues.push(moodResult.moodConfidence || 0.0);
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
          originalLanguage: translationConfig.originalLanguage || 'auto',
          targetLanguage: translationConfig.targetLanguage
        } : null,
        mood: moodResult
      };
      
    } catch (error) {
      logger.error('Error in AnalysisService.process:', error);
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
        originalLanguage: translationConfig.originalLanguage || existingOriginalLanguage || 'auto'
      };

      const startTime = Date.now();
      let translationResult = null;
      let moodResult = null;

      if (actions.translate) {
        const fullLyrics = await this.fetchFullLyrics(
          lyricsRecord.plainLyrics || lyricsRecord.lyrics,
          lyricsResult.externalID
        );

        translationResult = await this.processTranslation(
          fullLyrics,
          finalTranslationConfig,
          processingID
        );
      }

      if (actions.mood) {
        moodResult = null;
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

        updateFields.push(`originallanguage = $${paramIndex++}`);
        updateValues.push(finalTranslationConfig.originalLanguage);

        updateFields.push(`targetlanguage = $${paramIndex++}`);
        updateValues.push(finalTranslationConfig.targetLanguage);

        updateFields.push(`translationconfidence = $${paramIndex++}`);
        updateValues.push(0.95);
      }

      if (moodResult) {
        updateFields.push(`moodtype = $${paramIndex++}`);
        updateValues.push(moodResult.moodType || null);

        updateFields.push(`moodscore = $${paramIndex++}`);
        updateValues.push(moodResult.moodScore || 0.00);

        updateFields.push(`moodconfidence = $${paramIndex++}`);
        updateValues.push(moodResult.moodConfidence || 0.0);
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
          originalLanguage: finalTranslationConfig.originalLanguage,
          targetLanguage: finalTranslationConfig.targetLanguage
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
    if (!lyricsRecord || !lyricsRecord.id) {
      throw new Error('Lyrics record must have an id');
    }
    
    const externalID = parseInt(String(lyricsRecord.id), 10);
    if (isNaN(externalID)) {
      throw new Error(`Invalid externalID: ${lyricsRecord.id}`);
    }
    
    const findQuery = `SELECT * FROM lyricssearchresults WHERE externalid = $1 LIMIT 1`;
    const findResult = await DatabaseService.query(findQuery, [externalID]);
    const existing = findResult.rows[0] || null;
    
      if (existing) {
        return {
        lyricsSearchResultID: existing.lyricssearchresultid,
        externalID: existing.externalid,
        trackName: existing.trackname,
        artistName: existing.artistname,
        albumName: existing.albumname,
        duration: existing.duration,
        instrumental: existing.instrumental,
        lyricsPreview: existing.lyricspreview,
        sourceAPI: existing.sourceapi,
        usageCount: existing.usagecount,
        lastUsedAt: existing.lastusedat,
        fetchedAt: existing.fetchedat,
        createdAt: existing.createdat,
        updatedAt: existing.updatedat
      };
    }
    
    let duration = null;
    if (lyricsRecord.duration != null) {
      duration = parseInt(String(lyricsRecord.duration), 10);
      if (isNaN(duration)) {
        duration = null;
      }
    }
    
    const fullLyricsText = lyricsRecord.plainLyrics || lyricsRecord.lyrics || '';
    const lyricsPreview = fullLyricsText
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
      'lrclib'
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
  
  static async fetchFullLyrics(lyricsFromRecord, externalID) {
    if (lyricsFromRecord && lyricsFromRecord.trim()) {
      return lyricsFromRecord;
    }
    
    if (!externalID) {
      throw new Error('Cannot fetch lyrics: externalID is missing');
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
      return {
        songID: existingSong.songid,
        songName: existingSong.songname,
        artistName: existingSong.artistname,
        genre: existingSong.genre,
        lyrics: existingSong.lyrics,
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
    
    const songInsertQuery = `
      INSERT INTO songs 
      (songname, artistname, genre, lyrics, duration, filepath, lyricssearchresultid, sourcestatus, createdby) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *
    `;
    const songInsertValues = [
      lyricsRecord.trackName || lyricsRecord.songName || '',
      lyricsRecord.artistName || '',
      null,
      null,
      songDuration,
      null,
      lyricsResult.lyricsSearchResultID,
      'from_lyrics_search',
      validUserId
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
    cleanedText = cleanedText.trim();
    cleanedText = cleanedText.replace(/\\n/g, '\n');
    
    const sections = cleanedText.split(/\n\n+/);
    const result = [];
    
    for (const section of sections) {
      if (!section.trim()) continue;
      
      const lines = section.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length === 0) continue;
      
      let i = 0;
      while (i < lines.length) {
        let originalLine = (lines[i] || '').replace(/\*\*/g, '').trim();

        if (/^-{2,}$/.test(originalLine)) {
          i += 1;
          continue;
        }

        let translatedLine = '';

        if (i + 1 < lines.length) {
          const rawNext = (lines[i + 1] || '').trim();
          if (!/^-{2,}$/.test(rawNext)) {
            translatedLine = rawNext.replace(/\*\*/g, '').trim();
          }
          i += 2;
        } else {
          i += 1;
        }

        // Truncate original line to first N characters (code points) to support multi-language
        const MAX_CHARS_ORIGINAL = 10;
        if (originalLine) {
          const chars = Array.from(originalLine);
          if (chars.length > MAX_CHARS_ORIGINAL) {
            originalLine = chars.slice(0, MAX_CHARS_ORIGINAL).join('').trim();
          }
        }

        if (originalLine) {
          result.push(originalLine);
          if (translatedLine) {
            result.push(translatedLine);
          }
          result.push('');
        }
      }
    }
    
    while (result.length > 0 && result[result.length - 1] === '') {
      result.pop();
    }
    
    return result.join('\n');
  }
  
  static async processTranslation(lyrics, translationConfig, processingID) {
    if (!lyrics) {
      throw new Error('Lyrics text is required for translation');
    }
    
    const originalLanguage = translationConfig.originalLanguage || 'auto';
    const targetLanguage = translationConfig.targetLanguage || 'th';
    
    logger.info(`Processing translation for processingID: ${processingID}`, {
      originalLanguage,
      targetLanguage,
      lyricsLength: lyrics.length
    });
    
    const result = await TranslateService.getTranslate(
      originalLanguage,
      targetLanguage,
      lyrics
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
    
    return {
      translation: translated.translation || '',
      interpretation: translated.interpretation || null
    };
  }
}

module.exports = AnalysisService;

