/* eslint-env jest */
const ForYouService = require('../../../services/foryouService');
const DatabaseService = require('../../../services/databaseService');

jest.mock('../../../services/databaseService');
jest.mock('../../../middleware/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ForYouService.getYourMood', () => {
  const userID = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should map database rows to response shape with parsed mood JSON and numeric fields', async () => {
    DatabaseService.query.mockResolvedValueOnce({
      rows: [{
        songid: 'song-1',
        songname: 'Track One',
        artistname: 'Artist',
        genre: 'pop',
        duration: 210,
        processingid: 'proc-1',
        coverimage: 'cover.png',
        moodtype: JSON.stringify([{ type: 'Happy', percentage: 85 }]),
        analysis_count: '4',
        has_translation: 1,
        is_favorite: 1,
        view_count: '6',
        save_count: '2',
        total_play_duration: '420',
        rating_avg: '4.5',
        rating_count: '3',
        score: '25.3',
        last_analyzed_at: new Date('2024-01-01T00:00:00.000Z'),
        last_played_at: new Date('2024-02-01T00:00:00.000Z'),
        last_activity_at: new Date('2024-02-02T00:00:00.000Z'),
      }],
    });

    const result = await ForYouService.getYourMood(userID, 10, 0);

    expect(DatabaseService.query).toHaveBeenCalledWith(expect.any(String), [userID, 10, 0]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'song-1',
      processingID: 'proc-1',
      title: 'Track One',
      artist: 'Artist',
      genre: 'pop',
      duration: 210,
      image: 'cover.png',
      mood: { type: 'Happy', percentage: 85 },
      analysisCount: 4,
      hasTranslation: true,
      isFavorite: true,
      viewCount: 6,
      saveCount: 2,
      totalPlayDuration: 420,
      ratingAverage: 4.5,
      ratingCount: 3,
      score: 25.3,
      lastAnalyzedAt: new Date('2024-01-01T00:00:00.000Z'),
      lastPlayedAt: new Date('2024-02-01T00:00:00.000Z'),
      lastActivityAt: new Date('2024-02-02T00:00:00.000Z'),
    });
  });

  test('should fallback to raw mood string when JSON parsing fails', async () => {
    DatabaseService.query.mockResolvedValueOnce({
      rows: [{
        songid: 'song-2',
        songname: 'Track Two',
        artistname: 'Artist',
        genre: null,
        duration: null,
        processingid: null,
        coverimage: null,
        moodtype: 'mysterious',
        analysis_count: null,
        has_translation: 0,
        is_favorite: 0,
        view_count: null,
        save_count: null,
        total_play_duration: null,
        rating_avg: null,
        rating_count: null,
        score: null,
        last_analyzed_at: null,
        last_played_at: null,
        last_activity_at: null,
      }],
    });

    const result = await ForYouService.getYourMood(userID, 5, 0);

    expect(result[0].mood).toEqual({ type: 'mysterious', percentage: 0 });
    expect(result[0].analysisCount).toBe(0);
    expect(result[0].viewCount).toBe(0);
    expect(result[0].score).toBe(0);
  });

  test('should return empty array when no rows are found', async () => {
    DatabaseService.query.mockResolvedValueOnce({
      rows: [],
    });

    const result = await ForYouService.getYourMood(userID, 5, 5);

    expect(result).toEqual([]);
  });
});

