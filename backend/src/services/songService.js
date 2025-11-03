const DatabaseService = require('./databaseService');
const lyricsService = require('./lyricsService');
const { logger } = require('../middleware/logger');

class SongService {
  static async getSongDetail(songID, processingID = null) {
    try {
      if (!songID || songID === 'undefined') {
        throw new Error('Invalid songID');
      }

      const songQuery = `SELECT * FROM songs WHERE songid = $1 LIMIT 1`;
      const songResult = await DatabaseService.query(songQuery, [songID]);
      
      if (!songResult.rows || songResult.rows.length === 0) {
        throw new Error('Song not found');
      }

      const songRaw = songResult.rows[0];
      
      let lyrics = songRaw.lyrics;
      let syncedLyrics = null;
      
      if (!lyrics && songRaw.sourcestatus === 'from_lyrics_search' && songRaw.lyricssearchresultid) {
        try {
          const lyricsResultQuery = `SELECT externalid FROM lyricssearchresults WHERE lyricssearchresultid = $1 LIMIT 1`;
          const lyricsResult = await DatabaseService.query(lyricsResultQuery, [songRaw.lyricssearchresultid]);
          
          if (lyricsResult.rows && lyricsResult.rows.length > 0) {
            const externalID = lyricsResult.rows[0].externalid;
            const fetched = await lyricsService.getById(externalID);
            lyrics = fetched?.plainLyrics || null;
            syncedLyrics = fetched?.syncedLyrics || null;
            logger.info(`Fetched lyrics and syncedLyrics from external API for song ${songID}`);
          }
        } catch (error) {
          logger.warn(`Failed to fetch lyrics from external API for song ${songID}:`, error.message);
          lyrics = null;
          syncedLyrics = null;
        }
      }
      
      const song = {
        songID: songRaw.songid,
        songName: songRaw.songname,
        artistName: songRaw.artistname,
        genre: songRaw.genre,
        lyrics: lyrics,
        syncedLyrics: syncedLyrics,
        duration: songRaw.duration,
        filePath: songRaw.filepath,
        isActive: songRaw.isactive,
        approved: songRaw.approved,
        approvedBy: songRaw.approvedby,
        playCount: songRaw.playcount,
        popularity: songRaw.popularity,
        lyricsSearchResultID: songRaw.lyricssearchresultid,
        sourceStatus: songRaw.sourcestatus,
        createdBy: songRaw.createdby,
        updatedBy: songRaw.updatedby,
        createdAt: songRaw.createdat,
        updatedAt: songRaw.updatedat
      };

      let processing = null;
      if (processingID && processingID !== 'undefined') {
        const processingQuery = `SELECT * FROM songaiprocessing WHERE processingid = $1 LIMIT 1`;
        const processingResult = await DatabaseService.query(processingQuery, [processingID]);
        
        if (processingResult.rows && processingResult.rows.length > 0) {
          const procRaw = processingResult.rows[0];
          
          if (procRaw.songid === songID) {
            let mappedTranslation = procRaw.translation;
            if (lyrics && procRaw.translation && songRaw.sourcestatus === 'from_lyrics_search') {
              mappedTranslation = this.mapTranslationToFull(procRaw.translation, lyrics);
            }
            
            processing = {
              processingID: procRaw.processingid,
              songID: procRaw.songid,
              aiModel: procRaw.aimodel,
              processingTime: procRaw.processingtime,
              summary: procRaw.summary,
              summaryLanguage: procRaw.summarylanguage,
              summaryConfidence: procRaw.summaryconfidence,
              translation: mappedTranslation,
              interpretation: procRaw.interpretation,
              originalLanguage: procRaw.originallanguage,
              targetLanguage: procRaw.targetlanguage,
              translationConfidence: procRaw.translationconfidence,
              moodType: procRaw.moodtype,
              moodScore: procRaw.moodscore ? parseFloat(procRaw.moodscore) : null,
              moodConfidence: procRaw.moodconfidence,
              totalRatings: procRaw.totalratings,
              averageRating: procRaw.averagerating ? parseFloat(procRaw.averagerating) : null,
              starCount: procRaw.starcount,
              status: procRaw.status,
              isCompleteProcessing: procRaw.iscompleteprocessing,
              errorMessage: procRaw.errormessage,
              createdBy: procRaw.createdby,
              updatedBy: procRaw.updatedby,
              createdAt: procRaw.createdat,
              updatedAt: procRaw.updatedat,
              shareStatus: procRaw.sharestatus,
              approvalStatus: procRaw.approvalstatus,
              approvedBy: procRaw.approvedby,
              approvalNote: procRaw.approvalnote,
              approvedAt: procRaw.approvedat,
              isPublic: procRaw.ispublic || false,
              youtubeVideoId: procRaw.youtubevideoid || null
            };
          }
        }
      }

      return {
        song,
        processing
      };
    } catch (error) {
      logger.error('Error in SongService.getSongDetail:', error);
      throw error;
    }
  }
  
  /**
   * Map translation preview back to full original lyrics for frontend display
   * @param {string} translationWithPreview - Translation with preview (format: "preview\nTranslation\n\npreview\nTranslation")
   * @param {string} fullLyrics - Full original lyrics text
   * @returns {string} Mapped translation with full original lyrics
   */
  static mapTranslationToFull(translationWithPreview, fullLyrics) {
    if (!translationWithPreview || !fullLyrics) {
      return translationWithPreview;
    }
    
    const translationLines = translationWithPreview.split('\n');
    const allLyricsLines = fullLyrics.split('\n');
    const lyricsLines = allLyricsLines.map(line => line.trim()).filter(line => line.length > 0);
    const result = [];
    
    let i = 0;
    let lyricsIndex = 0;
    
    while (i < translationLines.length) {
      while (i < translationLines.length && translationLines[i].trim() === '') {
        i++;
      }
      if (i >= translationLines.length) break;
      
      const previewText = translationLines[i].trim();
      i++;
      
      while (i < translationLines.length && translationLines[i].trim() === '') {
        i++;
      }
      
      let translatedText = '';
      if (i < translationLines.length && translationLines[i].trim() !== '') {
        translatedText = translationLines[i].trim();
        i++;
      }
      
      let matchedLine = null;
      if (lyricsIndex < lyricsLines.length) {
        matchedLine = lyricsLines[lyricsIndex];
        lyricsIndex++;
      } else {
        const previewMatch = previewText.substring(0, Math.min(10, previewText.length));
        for (let j = 0; j < lyricsLines.length; j++) {
          const lyricsLine = lyricsLines[j];
          const lyricsPreview = lyricsLine.substring(0, Math.min(10, lyricsLine.length));
          if (lyricsPreview === previewMatch) {
            matchedLine = lyricsLine;
            lyricsIndex = j + 1;
            break;
          }
        }
      }
      
      if (matchedLine) {
        result.push(matchedLine);
      } else {
        result.push(previewText);
      }
      
      if (translatedText) {
        result.push(translatedText);
        result.push('');
      }
    }
    while (result.length > 0 && result[result.length - 1] === '') {
      result.pop();
    }
    
    return result.join('\n');
  }
}

module.exports = SongService;

