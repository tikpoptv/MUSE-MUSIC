const DatabaseService = require('./databaseService');
const { logger } = require('../middleware/logger');

class SongService {
  static async getSongDetail(songID, processingID = null) {
    try {
      // Validate songID
      if (!songID || songID === 'undefined') {
        throw new Error('Invalid songID');
      }

      // Fetch song data
      const songQuery = `SELECT * FROM songs WHERE songid = $1 LIMIT 1`;
      const songResult = await DatabaseService.query(songQuery, [songID]);
      
      if (!songResult.rows || songResult.rows.length === 0) {
        throw new Error('Song not found');
      }

      const songRaw = songResult.rows[0];
      const song = {
        songID: songRaw.songid,
        songName: songRaw.songname,
        artistName: songRaw.artistname,
        genre: songRaw.genre,
        lyrics: songRaw.lyrics,
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

      // Fetch processing data if processingID provided
      let processing = null;
      if (processingID && processingID !== 'undefined') {
        const processingQuery = `SELECT * FROM songaiprocessing WHERE processingid = $1 LIMIT 1`;
        const processingResult = await DatabaseService.query(processingQuery, [processingID]);
        
        if (processingResult.rows && processingResult.rows.length > 0) {
          const procRaw = processingResult.rows[0];
          
          // Verify processing belongs to this song
          if (procRaw.songid === songID) {
            processing = {
              processingID: procRaw.processingid,
              songID: procRaw.songid,
              aiModel: procRaw.aimodel,
              processingTime: procRaw.processingtime,
              summary: procRaw.summary,
              summaryLanguage: procRaw.summarylanguage,
              summaryConfidence: procRaw.summaryconfidence,
              translation: procRaw.translation,
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
              isPublic: procRaw.ispublic || false
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
}

module.exports = SongService;

