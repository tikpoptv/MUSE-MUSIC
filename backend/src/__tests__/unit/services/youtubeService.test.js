/* eslint-env jest */
const YouTubeService = require('../../../services/youtubeService');
const { config } = require('../../../config/env');

// Mock dependencies
jest.mock('../../../config/env', () => ({
  config: {
    youtube: {
      apiKey: 'test-api-key'
    }
  }
}));

jest.mock('../../../middleware/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

// Mock global fetch
global.fetch = jest.fn();

describe('YouTubeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchVideos', () => {
    const mockYouTubeResponse = {
      items: [
        {
          id: { videoId: 'abc123' },
          snippet: {
            title: 'Test Song - Official Audio',
            description: 'Test description',
            thumbnails: {
              high: { url: 'https://example.com/thumb.jpg' },
              default: { url: 'https://example.com/thumb-default.jpg' }
            },
            channelTitle: 'Test Channel',
            publishedAt: '2023-01-01T00:00:00Z'
          }
        },
        {
          id: { videoId: 'def456' },
          snippet: {
            title: 'Another Song',
            description: 'Another description',
            thumbnails: {
              default: { url: 'https://example.com/thumb2.jpg' }
            },
            channelTitle: 'Another Channel',
            publishedAt: '2023-01-02T00:00:00Z'
          }
        }
      ]
    };

    it('should search videos successfully with songName only', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockYouTubeResponse
      });

      const result = await YouTubeService.searchVideos('Test Song');

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=Test+Song+official+music+audio'),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        videoId: 'abc123',
        title: 'Test Song - Official Audio',
        description: 'Test description',
        thumbnail: 'https://example.com/thumb.jpg',
        channelTitle: 'Test Channel',
        publishedAt: '2023-01-01T00:00:00Z'
      });
    });

    it('should search videos with songName and artistName', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockYouTubeResponse
      });

      const result = await YouTubeService.searchVideos('Test Song', 'Test Artist');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=Test+Song+Test+Artist+official+music+audio'),
        expect.anything()
      );
      expect(result).toHaveLength(2);
    });

    it('should use custom maxResults parameter', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockYouTubeResponse
      });

      await YouTubeService.searchVideos('Test Song', null, 10);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('maxResults=10'),
        expect.anything()
      );
    });

    it('should append "official music audio" to search query', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockYouTubeResponse
      });

      await YouTubeService.searchVideos('My Song', 'My Artist');

      const fetchCall = fetch.mock.calls[0][0];
      expect(fetchCall).toContain('official+music+audio');
      expect(fetchCall).toContain('My+Song+My+Artist');
    });

    it('should return empty array when no results found', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] })
      });

      const result = await YouTubeService.searchVideos('Nonexistent Song');

      expect(result).toEqual([]);
    });

    it('should return empty array when items is undefined', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await YouTubeService.searchVideos('Test Song');

      expect(result).toEqual([]);
    });

    it('should use high quality thumbnail if available, otherwise default', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockYouTubeResponse
      });

      const result = await YouTubeService.searchVideos('Test Song');

      expect(result[0].thumbnail).toBe('https://example.com/thumb.jpg'); // has high
      expect(result[1].thumbnail).toBe('https://example.com/thumb2.jpg'); // only default
    });

    it('should throw error when songName is missing', async () => {
      await expect(YouTubeService.searchVideos('')).rejects.toThrow('Song name is required');
      await expect(YouTubeService.searchVideos('   ')).rejects.toThrow('Song name is required');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should throw error when API key is not configured', async () => {
      const originalApiKey = config.youtube.apiKey;
      config.youtube.apiKey = null;

      await expect(YouTubeService.searchVideos('Test Song')).rejects.toThrow(
        'YouTube API key is not configured'
      );

      config.youtube.apiKey = originalApiKey;
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should throw error when YouTube API returns non-ok response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid request'
      });

      await expect(YouTubeService.searchVideos('Test Song')).rejects.toThrow(
        'YouTube API error: 400 Bad Request'
      );
    });

    it('should include required query parameters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockYouTubeResponse
      });

      await YouTubeService.searchVideos('Test Song');

      const fetchCall = fetch.mock.calls[0][0];
      expect(fetchCall).toContain('part=snippet');
      expect(fetchCall).toContain('type=video');
      expect(fetchCall).toContain('videoCategoryId=10'); // Music category
      expect(fetchCall).toContain('order=relevance');
      expect(fetchCall).toContain('key=test-api-key');
    });
  });

  describe('getVideoDetails', () => {
    const mockVideoDetailsResponse = {
      items: [
        {
          id: 'abc123',
          snippet: {
            title: 'Test Video',
            description: 'Test description',
            thumbnails: {
              high: { url: 'https://example.com/thumb.jpg' }
            },
            channelTitle: 'Test Channel',
            publishedAt: '2023-01-01T00:00:00Z'
          },
          contentDetails: {
            duration: 'PT3M45S'
          },
          statistics: {
            viewCount: '1000000',
            likeCount: '50000'
          }
        }
      ]
    };

    it('should get video details successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVideoDetailsResponse
      });

      const result = await YouTubeService.getVideoDetails('abc123');

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('id=abc123'),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual({
        videoId: 'abc123',
        title: 'Test Video',
        description: 'Test description',
        thumbnail: 'https://example.com/thumb.jpg',
        channelTitle: 'Test Channel',
        publishedAt: '2023-01-01T00:00:00Z',
        duration: 225, // 3*60 + 45
        viewCount: 1000000,
        likeCount: 50000
      });
    });

    it('should parse duration PT1H2M3S correctly (1 hour, 2 minutes, 3 seconds)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{
            ...mockVideoDetailsResponse.items[0],
            contentDetails: { duration: 'PT1H2M3S' }
          }]
        })
      });

      const result = await YouTubeService.getVideoDetails('abc123');

      expect(result.duration).toBe(3723); // 1*3600 + 2*60 + 3
    });

    it('should parse duration PT3M45S correctly (3 minutes, 45 seconds)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{
            ...mockVideoDetailsResponse.items[0],
            contentDetails: { duration: 'PT3M45S' }
          }]
        })
      });

      const result = await YouTubeService.getVideoDetails('abc123');

      expect(result.duration).toBe(225); // 3*60 + 45
    });

    it('should parse duration PT45S correctly (45 seconds only)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{
            ...mockVideoDetailsResponse.items[0],
            contentDetails: { duration: 'PT45S' }
          }]
        })
      });

      const result = await YouTubeService.getVideoDetails('abc123');

      expect(result.duration).toBe(45);
    });

    it('should parse duration PT2H30M correctly (2 hours, 30 minutes)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{
            ...mockVideoDetailsResponse.items[0],
            contentDetails: { duration: 'PT2H30M' }
          }]
        })
      });

      const result = await YouTubeService.getVideoDetails('abc123');

      expect(result.duration).toBe(9000); // 2*3600 + 30*60
    });

    it('should handle duration with no match (default to 0)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{
            ...mockVideoDetailsResponse.items[0],
            contentDetails: { duration: 'INVALID' }
          }]
        })
      });

      const result = await YouTubeService.getVideoDetails('abc123');

      expect(result.duration).toBe(0);
    });

    it('should handle missing statistics gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{
            ...mockVideoDetailsResponse.items[0],
            statistics: {}
          }]
        })
      });

      const result = await YouTubeService.getVideoDetails('abc123');

      expect(result.viewCount).toBe(0);
      expect(result.likeCount).toBe(0);
    });

    it('should use default thumbnail if high is not available', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{
            ...mockVideoDetailsResponse.items[0],
            snippet: {
              ...mockVideoDetailsResponse.items[0].snippet,
              thumbnails: {
                default: { url: 'https://example.com/default-thumb.jpg' }
              }
            }
          }]
        })
      });

      const result = await YouTubeService.getVideoDetails('abc123');

      expect(result.thumbnail).toBe('https://example.com/default-thumb.jpg');
    });

    it('should throw error when videoId is missing', async () => {
      await expect(YouTubeService.getVideoDetails('')).rejects.toThrow('Video ID is required');
      await expect(YouTubeService.getVideoDetails('   ')).rejects.toThrow('Video ID is required');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should throw error when video not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] })
      });

      await expect(YouTubeService.getVideoDetails('nonexistent')).rejects.toThrow(
        'Video not found'
      );
    });

    it('should throw error when API key is not configured', async () => {
      const originalApiKey = config.youtube.apiKey;
      config.youtube.apiKey = null;

      await expect(YouTubeService.getVideoDetails('abc123')).rejects.toThrow(
        'YouTube API key is not configured'
      );

      config.youtube.apiKey = originalApiKey;
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should throw error when YouTube API returns non-ok response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'API quota exceeded'
      });

      await expect(YouTubeService.getVideoDetails('abc123')).rejects.toThrow(
        'YouTube API error: 403 Forbidden'
      );
    });

    it('should include required query parameters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVideoDetailsResponse
      });

      await YouTubeService.getVideoDetails('abc123');

      const fetchCall = fetch.mock.calls[0][0];
      expect(fetchCall).toContain('part=snippet%2CcontentDetails%2Cstatistics');
      expect(fetchCall).toContain('id=abc123');
      expect(fetchCall).toContain('key=test-api-key');
    });
  });
});

