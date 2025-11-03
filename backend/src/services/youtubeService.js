const { config } = require('../config/env');
const { logger } = require('../middleware/logger');

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

class YouTubeService {
  static async searchVideos(songName, artistName = null, maxResults = 5) {
    try {
      if (!config.youtube.apiKey) {
        throw new Error('YouTube API key is not configured');
      }

      if (!songName || songName.trim() === '') {
        throw new Error('Song name is required');
      }

      let query = songName.trim();
      if (artistName && artistName.trim() !== '') {
        query = `${songName} ${artistName}`.trim();
      }
      
      query = `${query} official music audio`.trim();

      const url = new URL(`${YOUTUBE_API_BASE}/search`);
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('q', query);
      url.searchParams.append('type', 'video');
      url.searchParams.append('maxResults', maxResults.toString());
      url.searchParams.append('key', config.youtube.apiKey);
      url.searchParams.append('videoCategoryId', '10');
      url.searchParams.append('order', 'relevance');

      logger.info('Searching YouTube videos', { query, maxResults });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('YouTube API error', { 
          status: response.status, 
          statusText: response.statusText,
          errorText 
        });
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        logger.info('No YouTube videos found', { query });
        return [];
      }

      const videos = data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt
      }));

      logger.info('YouTube search successful', { 
        query, 
        resultsCount: videos.length 
      });

      return videos;

    } catch (error) {
      logger.error('Error in YouTubeService.searchVideos:', error);
      throw error;
    }
  }

  static async getVideoDetails(videoId) {
    try {
      if (!config.youtube.apiKey) {
        throw new Error('YouTube API key is not configured');
      }

      if (!videoId || videoId.trim() === '') {
        throw new Error('Video ID is required');
      }

      const url = new URL(`${YOUTUBE_API_BASE}/videos`);
      url.searchParams.append('part', 'snippet,contentDetails,statistics');
      url.searchParams.append('id', videoId);
      url.searchParams.append('key', config.youtube.apiKey);

      logger.info('Fetching YouTube video details', { videoId });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('YouTube API error', { 
          status: response.status, 
          statusText: response.statusText,
          errorText 
        });
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = data.items[0];
      const durationStr = video.contentDetails.duration;
      const durationMatch = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      let durationSeconds = 0;
      if (durationMatch) {
        const hours = parseInt(durationMatch[1] || 0);
        const minutes = parseInt(durationMatch[2] || 0);
        const seconds = parseInt(durationMatch[3] || 0);
        durationSeconds = hours * 3600 + minutes * 60 + seconds;
      }

      const videoDetails = {
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        duration: durationSeconds,
        viewCount: parseInt(video.statistics.viewCount || 0),
        likeCount: parseInt(video.statistics.likeCount || 0)
      };

      logger.info('YouTube video details fetched', { videoId, duration: durationSeconds });

      return videoDetails;

    } catch (error) {
      logger.error('Error in YouTubeService.getVideoDetails:', error);
      throw error;
    }
  }
}

module.exports = YouTubeService;

