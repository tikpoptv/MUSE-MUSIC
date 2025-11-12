/* eslint-env jest */
const RatingService = require('../../../services/ratingService');
const DatabaseService = require('../../../services/databaseService');

// Mock dependencies
jest.mock('../../../services/databaseService');
jest.mock('../../../middleware/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('RatingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitRating', () => {
    const mockProcessingID = '123e4567-e89b-12d3-a456-426614174000';
    const mockUserID = 'user-123';
    const mockRating = 5;
    const mockComment = 'Great song!';

    test('should submit a new rating successfully', async () => {
      // Mock processing exists
      DatabaseService.query
        .mockResolvedValueOnce({
          rows: [{ processingid: mockProcessingID }],
        })
        // Mock no existing rating
        .mockResolvedValueOnce({
          rows: [],
        })
        // Mock insert result
        .mockResolvedValueOnce({
          rows: [{
            ratingid: 'rating-123',
            processingid: mockProcessingID,
            userid: mockUserID,
            rating: mockRating,
            comment: mockComment,
            feedback: mockComment,
            createdat: new Date(),
            updatedat: new Date(),
          }],
        });

      const result = await RatingService.submitRating(
        mockProcessingID,
        mockUserID,
        mockRating,
        mockComment
      );

      expect(result).toBeDefined();
      expect(result.ratingid).toBe('rating-123');
      expect(result.rating).toBe(mockRating);
      expect(result.comment).toBe(mockComment);
      expect(DatabaseService.query).toHaveBeenCalledTimes(3);
    });

    test('should update existing rating', async () => {
      const newRating = 4;
      const newComment = 'Updated comment';

      // Mock processing exists
      DatabaseService.query
        .mockResolvedValueOnce({
          rows: [{ processingid: mockProcessingID }],
        })
        // Mock existing rating
        .mockResolvedValueOnce({
          rows: [{ ratingid: 'rating-123' }],
        })
        // Mock update result
        .mockResolvedValueOnce({
          rows: [{
            ratingid: 'rating-123',
            processingid: mockProcessingID,
            userid: mockUserID,
            rating: newRating,
            comment: newComment,
            feedback: newComment,
            createdat: new Date(),
            updatedat: new Date(),
          }],
        });

      const result = await RatingService.submitRating(
        mockProcessingID,
        mockUserID,
        newRating,
        newComment
      );

      expect(result).toBeDefined();
      expect(result.rating).toBe(newRating);
      expect(result.comment).toBe(newComment);
      expect(DatabaseService.query).toHaveBeenCalledTimes(3);
    });

    test('should throw error if processing not found', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: [],
      });

      await expect(
        RatingService.submitRating(mockProcessingID, mockUserID, mockRating)
      ).rejects.toThrow('Processing not found');
    });

    test('should throw error if rating is invalid (less than 1)', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: [{ processingid: mockProcessingID }],
      });

      await expect(
        RatingService.submitRating(mockProcessingID, mockUserID, 0)
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    test('should throw error if rating is invalid (greater than 5)', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: [{ processingid: mockProcessingID }],
      });

      await expect(
        RatingService.submitRating(mockProcessingID, mockUserID, 6)
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    test('should throw error if userID is missing', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: [{ processingid: mockProcessingID }],
      });

      await expect(
        RatingService.submitRating(mockProcessingID, null, mockRating)
      ).rejects.toThrow('User ID is required');
    });

    test('should handle null comment', async () => {
      DatabaseService.query
        .mockResolvedValueOnce({
          rows: [{ processingid: mockProcessingID }],
        })
        .mockResolvedValueOnce({
          rows: [],
        })
        .mockResolvedValueOnce({
          rows: [{
            ratingid: 'rating-123',
            processingid: mockProcessingID,
            userid: mockUserID,
            rating: mockRating,
            comment: null,
            feedback: null,
            createdat: new Date(),
            updatedat: new Date(),
          }],
        });

      const result = await RatingService.submitRating(
        mockProcessingID,
        mockUserID,
        mockRating,
        null
      );

      expect(result.comment).toBeNull();
    });
  });

  describe('getRatingStats', () => {
    const mockProcessingID = '123e4567-e89b-12d3-a456-426614174000';

    test('should return rating statistics', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: [{
          totalratings: '10',
          averagerating: '4.50',
          starcount: '5',
        }],
      });

      const result = await RatingService.getRatingStats(mockProcessingID);

      expect(result).toEqual({
        totalRatings: 10,
        averageRating: 4.50,
        starCount: 5,
      });
    });

    test('should return zero stats when no ratings exist', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: [{
          totalratings: '0',
          averagerating: null,
          starcount: null,
        }],
      });

      const result = await RatingService.getRatingStats(mockProcessingID);

      expect(result).toEqual({
        totalRatings: 0,
        averageRating: 0.00,
        starCount: 0,
      });
    });

    test('should handle database errors', async () => {
      DatabaseService.query.mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      await expect(
        RatingService.getRatingStats(mockProcessingID)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('getUserRating', () => {
    const mockProcessingID = '123e4567-e89b-12d3-a456-426614174000';
    const mockUserID = 'user-123';

    test('should return user rating if exists', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: [{
          ratingid: 'rating-123',
          processingid: mockProcessingID,
          userid: mockUserID,
          rating: 5,
          comment: 'Great!',
          feedback: 'Great!',
          createdat: new Date(),
          updatedat: new Date(),
        }],
      });

      const result = await RatingService.getUserRating(mockProcessingID, mockUserID);

      expect(result).toBeDefined();
      expect(result.ratingid).toBe('rating-123');
      expect(result.rating).toBe(5);
    });

    test('should return null if user rating does not exist', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: [],
      });

      const result = await RatingService.getUserRating(mockProcessingID, mockUserID);

      expect(result).toBeNull();
    });

    test('should handle database errors', async () => {
      DatabaseService.query.mockRejectedValueOnce(
        new Error('Database error')
      );

      await expect(
        RatingService.getUserRating(mockProcessingID, mockUserID)
      ).rejects.toThrow('Database error');
    });
  });
});

