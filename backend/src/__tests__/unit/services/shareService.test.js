/* eslint-env jest */
const ShareService = require('../../../services/shareService');
const DatabaseService = require('../../../services/databaseService');
const { config } = require('../../../config/env');

// Mock dependencies
jest.mock('../../../services/databaseService');
jest.mock('../../../config/env', () => ({
  config: {
    frontend: {
      url: 'https://test.example.com'
    },
    database: {
      user: 'test',
      host: 'localhost',
      name: 'testdb',
      password: 'test',
      port: 5432
    }
  }
}));
jest.mock('../../../middleware/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('ShareService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateShortLink', () => {
    it('should generate a 12-character hash from processingID', () => {
      const processingID = 'test-processing-123';
      const shortLink = ShareService.generateShortLink(processingID);

      expect(shortLink).toHaveLength(12);
      expect(typeof shortLink).toBe('string');
    });

    it('should generate consistent hash for same processingID', () => {
      const processingID = 'test-processing-123';
      const shortLink1 = ShareService.generateShortLink(processingID);
      const shortLink2 = ShareService.generateShortLink(processingID);

      expect(shortLink1).toBe(shortLink2);
    });

    it('should generate different hashes for different processingIDs', () => {
      const shortLink1 = ShareService.generateShortLink('processing-1');
      const shortLink2 = ShareService.generateShortLink('processing-2');

      expect(shortLink1).not.toBe(shortLink2);
    });
  });

  describe('createShareLink', () => {
    it('should return existing shortLink if already exists', async () => {
      const mockProcessing = {
        processingid: 'proc-123',
        shortlink: 'abc123def456',
        sharestatus: 'public_approved'
      };

      DatabaseService.query.mockResolvedValueOnce({
        rows: [mockProcessing]
      });

      const result = await ShareService.createShareLink('proc-123', 'user-1');

      expect(result).toEqual({
        processingID: 'proc-123',
        shortLink: 'abc123def456',
        shareUrl: 'https://test.example.com/share/abc123def456',
        alreadyExists: true
      });
      expect(DatabaseService.query).toHaveBeenCalledTimes(1);
    });

    it('should create new shortLink if does not exist', async () => {
      // Mock check query (no existing shortlink)
      DatabaseService.query.mockResolvedValueOnce({
        rows: [{ processingid: 'proc-123', shortlink: null }]
      });

      // Mock collision check (no collision)
      DatabaseService.query.mockResolvedValueOnce({
        rows: []
      });

      // Mock update query
      DatabaseService.query.mockResolvedValueOnce({
        rows: [{ processingid: 'proc-123', shortlink: 'newlink1234' }]
      });

      const result = await ShareService.createShareLink('proc-123', 'user-1');

      expect(result).toMatchObject({
        processingID: 'proc-123',
        shortLink: expect.any(String),
        shareUrl: expect.stringContaining('/share/'),
        alreadyExists: false
      });
      expect(DatabaseService.query).toHaveBeenCalledTimes(3);
    });

    it('should handle collision and retry with different hash', async () => {
      // Mock check query (no existing shortlink)
      DatabaseService.query.mockResolvedValueOnce({
        rows: [{ processingid: 'proc-123', shortlink: null }]
      });

      // Mock first collision check (collision exists)
      DatabaseService.query.mockResolvedValueOnce({
        rows: [{ processingid: 'other-proc' }]
      });

      // Mock second collision check (no collision)
      DatabaseService.query.mockResolvedValueOnce({
        rows: []
      });

      // Mock update query
      DatabaseService.query.mockResolvedValueOnce({
        rows: [{ processingid: 'proc-123', shortlink: 'newlink5678' }]
      });

      const result = await ShareService.createShareLink('proc-123', 'user-1');

      expect(result.alreadyExists).toBe(false);
      expect(DatabaseService.query).toHaveBeenCalledTimes(4);
    });

    it('should throw error after max collision attempts', async () => {
      // Mock check query
      DatabaseService.query.mockResolvedValueOnce({
        rows: [{ processingid: 'proc-123', shortlink: null }]
      });

      // Mock 10 collision checks (all collisions)
      for (let i = 0; i < 10; i++) {
        DatabaseService.query.mockResolvedValueOnce({
          rows: [{ processingid: 'other-proc' }]
        });
      }

      await expect(
        ShareService.createShareLink('proc-123', 'user-1')
      ).rejects.toThrow('Failed to generate unique short link after multiple attempts');
    });

    it('should throw error when processingID is missing', async () => {
      await expect(ShareService.createShareLink('')).rejects.toThrow(
        'processingID is required'
      );
      await expect(ShareService.createShareLink(null)).rejects.toThrow(
        'processingID is required'
      );
      expect(DatabaseService.query).not.toHaveBeenCalled();
    });

    it('should throw error when processing record not found', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: []
      });

      await expect(
        ShareService.createShareLink('nonexistent-proc', 'user-1')
      ).rejects.toThrow('Processing record not found');
    });

    it('should throw error when update fails', async () => {
      // Mock check query
      DatabaseService.query.mockResolvedValueOnce({
        rows: [{ processingid: 'proc-123', shortlink: null }]
      });

      // Mock collision check
      DatabaseService.query.mockResolvedValueOnce({
        rows: []
      });

      // Mock failed update
      DatabaseService.query.mockResolvedValueOnce({
        rows: []
      });

      await expect(
        ShareService.createShareLink('proc-123', 'user-1')
      ).rejects.toThrow('Failed to update processing record with short link');
    });

    it('should include userId in update query', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: [{ processingid: 'proc-123', shortlink: null }]
      });

      DatabaseService.query.mockResolvedValueOnce({
        rows: []
      });

      DatabaseService.query.mockResolvedValueOnce({
        rows: [{ processingid: 'proc-123', shortlink: 'abc123' }]
      });

      await ShareService.createShareLink('proc-123', 'user-999');

      const updateCall = DatabaseService.query.mock.calls[2];
      expect(updateCall[1]).toContain('user-999');
    });
  });

  describe('getProcessingByShortLink', () => {
    it('should return processing data when found and approved', async () => {
      const mockRow = {
        processingid: 'proc-123',
        songid: 'song-456',
        coverimage: 'https://example.com/cover.jpg',
        summary: 'Test summary',
        songname: 'Test Song',
        artistname: 'Test Artist'
      };

      DatabaseService.query.mockResolvedValueOnce({
        rows: [mockRow]
      });

      const result = await ShareService.getProcessingByShortLink('abc123def456');

      expect(result).toEqual({
        processingID: 'proc-123',
        songID: 'song-456',
        coverImage: 'https://example.com/cover.jpg',
        summary: 'Test summary',
        songName: 'Test Song',
        artistName: 'Test Artist'
      });
      expect(DatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining("sharestatus = 'public_approved'"),
        ['abc123def456']
      );
    });

    it('should return null when shortLink not found', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: []
      });

      const result = await ShareService.getProcessingByShortLink('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw error when shortLink is missing', async () => {
      await expect(ShareService.getProcessingByShortLink('')).rejects.toThrow(
        'shortLink is required'
      );
      await expect(ShareService.getProcessingByShortLink(null)).rejects.toThrow(
        'shortLink is required'
      );
      expect(DatabaseService.query).not.toHaveBeenCalled();
    });

    it('should query with approval filters', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: []
      });

      await ShareService.getProcessingByShortLink('test123');

      const queryCall = DatabaseService.query.mock.calls[0];
      const query = queryCall[0];
      expect(query).toContain("sharestatus = 'public_approved'");
      expect(query).toContain("approvalstatus = 'approved'");
    });
  });
});

