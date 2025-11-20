const DatabaseService = require('./databaseService');
const lyricsService = require('./lyricsService');
const YouTubeService = require('./youtubeService');
const { transcriptToLRC } = require('../utils/youtubeTranscriptUtils');
const { logger } = require('../middleware/logger');

const LANGUAGE_CODE_TO_NAME = {
  en: 'English',
  th: 'Thai',
  lo: 'Lao',
  ko: 'Korean',
  ja: 'Japanese',
  zh: 'Chinese',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  vi: 'Vietnamese',
  id: 'Indonesian',
  ms: 'Malay',
  hi: 'Hindi'
};

const normalizeLanguageInput = (language) => {
  if (!language || typeof language !== 'string') {
    return null;
  }

  const trimmed = language.trim();
  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();

  if (LANGUAGE_CODE_TO_NAME[lower]) {
    return LANGUAGE_CODE_TO_NAME[lower];
  }

  const matchedName = Object.values(LANGUAGE_CODE_TO_NAME).find(
    (name) => name.toLowerCase() === lower
  );

  return matchedName || trimmed;
};

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
      let syncedLyrics = songRaw.syncedlyrics || null;
      
      // Fetch lyrics from external API if needed (preview to full mapping)
      if ((!lyrics || !syncedLyrics) && (songRaw.sourcestatus === 'from_lyrics_search' || songRaw.sourcestatus === 'external') && songRaw.lyricssearchresultid) {
        try {
          const lyricsResultQuery = `SELECT externalid, sourceapi FROM lyricssearchresults WHERE lyricssearchresultid = $1 LIMIT 1`;
          const lyricsResult = await DatabaseService.query(lyricsResultQuery, [songRaw.lyricssearchresultid]);
          
          if (lyricsResult.rows && lyricsResult.rows.length > 0) {
            const externalID = lyricsResult.rows[0].externalid;
            const sourceAPI = lyricsResult.rows[0].sourceapi;
            
            if (sourceAPI === 'youtube') {
              // Fetch from YouTube transcript
              try {
                const transcript = await YouTubeService.getTranscript(externalID, {
                  format: 'raw',
                  strategy: 'fallback'
                });
                let transcriptSegments = [];
                if (Array.isArray(transcript.transcript)) {
                  transcriptSegments = transcript.transcript;
                } else if (transcript.transcript && typeof transcript.transcript === 'object') {
                  const firstArray = Object.values(transcript.transcript).find((value) => Array.isArray(value));
                  transcriptSegments = firstArray || [];
                }
                
                if (transcriptSegments.length > 0) {
                  const { transcriptToPlainText, transcriptToLRC } = require('../utils/youtubeTranscriptUtils');
                  lyrics = lyrics || transcriptToPlainText(transcriptSegments) || null;
                  syncedLyrics = syncedLyrics || transcriptToLRC(transcriptSegments) || null;
                  logger.info(`Fetched lyrics and syncedLyrics from YouTube transcript for song ${songID}`);
                }
              } catch (youtubeError) {
                logger.warn(`Failed to fetch YouTube transcript for song ${songID}:`, youtubeError.message);
              }
            } else if (sourceAPI === 'lrclib') {
              // Fetch from LRCLIB API
              const fetched = await lyricsService.getById(externalID);
              lyrics = lyrics || fetched?.plainLyrics || null;
              syncedLyrics = syncedLyrics || fetched?.syncedLyrics || null;
              logger.info(`Fetched lyrics and syncedLyrics from LRCLIB API for song ${songID}`);
            }
          }
        } catch (error) {
          logger.warn(`Failed to fetch lyrics from external API for song ${songID}:`, error.message);
          lyrics = lyrics || null;
          syncedLyrics = syncedLyrics || null;
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
            // Map preview to full for both LRCLIB (from_lyrics_search) and YouTube (external)
            if (lyrics && procRaw.translation && (songRaw.sourcestatus === 'from_lyrics_search' || songRaw.sourcestatus === 'external')) {
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
              mood: (() => {
                if (!procRaw.moodtype) return null;
                try {
                  const parsed = JSON.parse(procRaw.moodtype);
                  if (Array.isArray(parsed)) {
                    return parsed;
                  }
                  // eslint-disable-next-line no-empty
                } catch (e) {
                  // Invalid JSON, fall through to legacy format
                }
                if (procRaw.moodtype && procRaw.moodscore) {
                  return [{
                    type: procRaw.moodtype,
                    percentage: parseFloat(procRaw.moodscore) <= 1 ? parseFloat(procRaw.moodscore) * 100 : parseFloat(procRaw.moodscore)
                  }];
                }
                return null;
              })(),
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
              coverImage: procRaw.coverimage || null,
              youtubeVideoId: procRaw.youtubevideoid || null,
              syncConfirmed: procRaw.syncconfirmed || false,
              songStartTime: procRaw.songstarttime ? parseFloat(procRaw.songstarttime) : null
            };

            if (!syncedLyrics && procRaw.youtubevideoid) {
              try {
                const transcript = await YouTubeService.getTranscript(procRaw.youtubevideoid, {
                  format: 'raw',
                  strategy: 'fallback'
                });
                let transcriptSegments = [];
                if (Array.isArray(transcript.transcript)) {
                  transcriptSegments = transcript.transcript;
                } else if (transcript.transcript && typeof transcript.transcript === 'object') {
                  const firstArray = Object.values(transcript.transcript).find((value) => Array.isArray(value));
                  transcriptSegments = firstArray || [];
                }
                if (transcriptSegments.length > 0) {
                  syncedLyrics = transcriptToLRC(transcriptSegments);
                }
              } catch (error) {
                logger.warn('Failed to fetch YouTube transcript for synced lyrics', {
                  songID,
                  videoId: procRaw.youtubevideoid,
                  error: error.message
                });
              }
            }
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

  static async checkProcessingByLanguage(songID, targetLanguage) {
    try {
      if (!songID || songID === 'undefined') {
        throw new Error('Invalid songID');
      }

      if (!targetLanguage) {
        throw new Error('targetLanguage is required');
      }

      const languageName = normalizeLanguageInput(targetLanguage);
      if (!languageName) {
        throw new Error('targetLanguage is required');
      }

      const query = `
        SELECT processingid, songid, targetlanguage, totalratings, averagerating, createdat
        FROM songaiprocessing
        WHERE songid = $1
          AND targetlanguage = $2
          AND approvalstatus = 'approved'
          AND sharestatus = 'public_approved'
        ORDER BY 
          CASE WHEN totalratings > 0 THEN 0 ELSE 1 END,
          totalratings DESC,
          averagerating DESC NULLS LAST,
          createdat DESC
        LIMIT 1
      `;

      const result = await DatabaseService.query(query, [songID, languageName]);

      if (result.rows && result.rows.length > 0) {
        const processing = result.rows[0];
        return {
          exists: true,
          processingID: processing.processingid,
          totalRatings: processing.totalratings || 0,
          averageRating: processing.averagerating ? parseFloat(processing.averagerating) : null
        };
      }

      return {
        exists: false,
        processingID: null
      };
    } catch (error) {
      logger.error('Error in SongService.checkProcessingByLanguage:', error);
      throw error;
    }
  }

  static async getProcessingVersions(songID, targetLanguage = null) {
    try {
      if (!songID || songID === 'undefined') {
        throw new Error('Invalid songID');
      }

      const params = [songID];
      let paramIndex = 2;

      let query = `
        SELECT 
          processingid,
          songid,
          targetlanguage,
          totalratings,
          averagerating,
          createdat,
          updatedat,
          approvedat,
          approvalstatus,
          sharestatus,
          status
        FROM songaiprocessing
        WHERE songid = $1
          AND status = 'completed'
          AND approvalstatus = 'approved'
          AND sharestatus = 'public_approved'
      `;

      const normalizedLanguage = normalizeLanguageInput(targetLanguage);
      if (normalizedLanguage) {
        query += ` AND LOWER(targetlanguage) = LOWER($${paramIndex})`;
        params.push(normalizedLanguage);
        paramIndex++;
      }

      query += `
        ORDER BY 
          CASE WHEN totalratings > 0 THEN 0 ELSE 1 END,
          totalratings DESC,
          averagerating DESC NULLS LAST,
          COALESCE(approvedat, createdat) DESC,
          createdat DESC
      `;

      const result = await DatabaseService.query(query, params);

      return result.rows.map((row, index) => ({
        versionNumber: index + 1,
        processingID: row.processingid,
        songID: row.songid,
        targetLanguage: row.targetlanguage,
        totalRatings: row.totalratings || 0,
        averageRating: row.averagerating ? parseFloat(row.averagerating) : null,
        createdAt: row.createdat,
        updatedAt: row.updatedat,
        approvedAt: row.approvedat,
        approvalStatus: row.approvalstatus,
        shareStatus: row.sharestatus,
        status: row.status
      }));
    } catch (error) {
      logger.error('Error in SongService.getProcessingVersions:', error);
      throw error;
    }
  }
  
  static async searchSongs(query, limit = 10) {
    try {
      if (!query || query.trim() === '') {
        return [];
      }

      const searchTerm = `%${query.trim().toLowerCase()}%`;
      const searchQuery = `
        SELECT DISTINCT ON (s.songid)
          s.songid,
          s.songname,
          s.artistname,
          s.genre,
          s.duration,
          p.processingid,
          p.coverimage,
          p.status,
          p.approvalstatus,
          p.sharestatus
        FROM songs s
        LEFT JOIN LATERAL (
          SELECT 
            p1.processingid,
            p1.coverimage,
            p1.status,
            p1.approvalstatus,
            p1.sharestatus
          FROM songaiprocessing p1
          WHERE p1.songid = s.songid
            AND p1.status = 'completed'
            AND p1.approvalstatus = 'approved'
            AND p1.sharestatus = 'public_approved'
          ORDER BY 
            CASE WHEN p1.totalratings > 0 THEN 0 ELSE 1 END,
            p1.totalratings DESC,
            p1.averagerating DESC NULLS LAST,
            p1.createdat DESC
          LIMIT 1
        ) p ON true
        WHERE s.isactive = TRUE
          AND (
            LOWER(s.songname) LIKE $1
            OR LOWER(s.artistname) LIKE $1
          )
        ORDER BY s.songid, s.songname
        LIMIT $2
      `;

      const result = await DatabaseService.query(searchQuery, [searchTerm, limit]);

      return result.rows.map(row => ({
        songID: row.songid,
        songName: row.songname,
        artistName: row.artistname,
        genre: row.genre,
        duration: row.duration,
        processingID: row.processingid,
        coverImage: row.coverimage,
        hasProcessing: !!row.processingid
      }));
    } catch (error) {
      logger.error('Error in SongService.searchSongs:', error);
      throw error;
    }
  }

  static mapTranslationToFull(translationWithPreview, fullLyrics) {
    if (!translationWithPreview || !fullLyrics) {
      return translationWithPreview;
    }
    
    const translationLines = translationWithPreview.split('\n').map(line => line.trim()).filter(line => line);
    let previewCount = 0;
    let fullTextCount = 0;
    const checkLines = Math.min(10, Math.floor(translationLines.length / 2));
    
    for (let i = 0; i < checkLines * 2 && i < translationLines.length; i += 2) {
      const originalLine = translationLines[i];
      if (originalLine) {
        if (originalLine.length <= 10) {
          previewCount++;
        } else {
          fullTextCount++;
        }
      }
    }
    
    // If most lines are full text (>10 chars), it's already full text, return as-is
    if (fullTextCount > previewCount) {
      return translationWithPreview;
    }
    
    // Otherwise, map preview to full lyrics
    const allLyricsLines = fullLyrics.split('\n');
    const lyricsLines = allLyricsLines.map(line => line.trim()).filter(line => line.length > 0);
    const result = [];
    
    let i = 0;
    let lyricsIndex = 0;
    
    while (i < translationLines.length) {
      const previewText = translationLines[i];
      i++;
      
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
