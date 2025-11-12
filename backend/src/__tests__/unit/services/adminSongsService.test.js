/* eslint-env jest */
const AdminSongsService = require('../../../services/adminSongsService');
const pool = require('../../../config/database').pool;

// Mock dependencies
jest.mock('../../../config/database', () => ({
  pool: {
    connect: jest.fn(),
  },
}));

jest.mock('../../../middleware/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('AdminSongsService', () => {
  let mockClient;
  let mockQuery;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockQuery = jest.fn();
    mockClient = {
      query: mockQuery,
      release: jest.fn(),
    };
    
    pool.connect.mockResolvedValue(mockClient);
  });

  describe('approveSong', () => {
    const mockProcessingID = '123e4567-e89b-12d3-a456-426614174000';
    const mockUserID = 'user-123';
    const mockNote = 'Approved by admin';

    test('should approve song successfully', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          processingid: mockProcessingID,
          songid: 'song-123',
          approvalstatus: 'approved',
          sharestatus: 'public_approved',
          approvedat: new Date(),
        }],
      });

      const result = await AdminSongsService.approveSong(mockProcessingID, mockUserID, mockNote);

      expect(result).toBeDefined();
      expect(result.processingID).toBe(mockProcessingID);
      expect(result.approvalStatus).toBe('approved');
      expect(result.shareStatus).toBe('public_approved');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE songaiprocessing'),
        [mockUserID, mockNote, mockProcessingID]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should throw error if processing not found', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
      });

      await expect(
        AdminSongsService.approveSong(mockProcessingID, mockUserID, mockNote)
      ).rejects.toThrow('Processing not found');

      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should handle null note', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          processingid: mockProcessingID,
          songid: 'song-123',
          approvalstatus: 'approved',
          sharestatus: 'public_approved',
          approvedat: new Date(),
        }],
      });

      const result = await AdminSongsService.approveSong(mockProcessingID, mockUserID, null);

      expect(result).toBeDefined();
      expect(result.approvalStatus).toBe('approved');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        [mockUserID, null, mockProcessingID]
      );
    });

    test('should handle database errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(
        AdminSongsService.approveSong(mockProcessingID, mockUserID, mockNote)
      ).rejects.toThrow('Database connection failed');

      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('rejectSong', () => {
    const mockProcessingID = '123e4567-e89b-12d3-a456-426614174000';
    const mockUserID = 'user-123';
    const mockNote = 'Rejected: Inappropriate content';

    test('should reject song successfully', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          processingid: mockProcessingID,
          songid: 'song-123',
          approvalstatus: 'rejected',
          sharestatus: 'private',
          approvedat: new Date(),
        }],
      });

      const result = await AdminSongsService.rejectSong(mockProcessingID, mockUserID, mockNote);

      expect(result).toBeDefined();
      expect(result.processingID).toBe(mockProcessingID);
      expect(result.approvalStatus).toBe('rejected');
      expect(result.shareStatus).toBe('private');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE songaiprocessing'),
        [mockUserID, mockNote, mockProcessingID]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should throw error if processing not found', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
      });

      await expect(
        AdminSongsService.rejectSong(mockProcessingID, mockUserID, mockNote)
      ).rejects.toThrow('Processing not found');

      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        AdminSongsService.rejectSong(mockProcessingID, mockUserID, mockNote)
      ).rejects.toThrow('Database error');

      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});

