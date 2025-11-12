/* eslint-env jest */
const SessionService = require('../../../services/sessionService');
const DatabaseService = require('../../../services/databaseService');

// Mock dependencies
jest.mock('../../../services/databaseService');

describe('SessionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create session with all parameters', async () => {
      const mockSession = {
        sessionid: 'sess-123',
        userid: 'user-1',
        deviceinfo: 'mobile',
        ipaddress: '192.168.1.1',
        useragent: 'Mozilla/5.0',
        isactive: true,
        expiresat: new Date(),
        createdat: new Date()
      };

      DatabaseService.query.mockResolvedValueOnce({
        rows: [mockSession]
      });

      const result = await SessionService.createSession(
        'user-1',
        'mobile',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toEqual(mockSession);
      expect(DatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO UserSessions'),
        expect.arrayContaining(['user-1', 'mobile', '192.168.1.1', 'Mozilla/5.0'])
      );
    });

    it('should create session with default deviceInfo', async () => {
      const mockSession = {
        sessionid: 'sess-123',
        userid: 'user-1',
        deviceinfo: 'desktop',
        isactive: true
      };

      DatabaseService.query.mockResolvedValueOnce({
        rows: [mockSession]
      });

      const result = await SessionService.createSession('user-1');

      expect(result.deviceinfo).toBe('desktop');
      expect(DatabaseService.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['user-1', 'desktop'])
      );
    });

    it('should set expiresAt to 7 days from now', async () => {
      const mockSession = { sessionid: 'sess-123' };
      DatabaseService.query.mockResolvedValueOnce({
        rows: [mockSession]
      });

      await SessionService.createSession('user-1');

      const queryCall = DatabaseService.query.mock.calls[0];
      const expiresAt = queryCall[1][4]; // 5th parameter
      const now = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

      // Check if expiresAt is approximately 7 days from now (within 1 minute)
      const diff = Math.abs(expiresAt - sevenDaysLater);
      expect(diff).toBeLessThan(60000); // 1 minute in milliseconds
    });
  });

  describe('findActiveSession', () => {
    it('should return active session when found', async () => {
      const mockSession = {
        sessionid: 'sess-123',
        userid: 'user-1',
        deviceinfo: 'desktop',
        isactive: true,
        expiresat: new Date(Date.now() + 86400000) // tomorrow
      };

      DatabaseService.query.mockResolvedValueOnce({
        rows: [mockSession]
      });

      const result = await SessionService.findActiveSession('sess-123');

      expect(result).toEqual(mockSession);
      expect(DatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('isActive = true'),
        ['sess-123']
      );
    });

    it('should return null when session not found', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: []
      });

      const result = await SessionService.findActiveSession('nonexistent');

      expect(result).toBeNull();
    });

    it('should query with expiresAt check', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: []
      });

      await SessionService.findActiveSession('sess-123');

      const queryCall = DatabaseService.query.mock.calls[0];
      expect(queryCall[0]).toContain('expiresAt > CURRENT_TIMESTAMP');
    });
  });

  describe('findUserActiveSessions', () => {
    it('should return all active sessions for user', async () => {
      const mockSessions = [
        { sessionid: 'sess-1', userid: 'user-1', deviceinfo: 'desktop' },
        { sessionid: 'sess-2', userid: 'user-1', deviceinfo: 'mobile' }
      ];

      DatabaseService.query.mockResolvedValueOnce({
        rows: mockSessions
      });

      const result = await SessionService.findUserActiveSessions('user-1');

      expect(result).toEqual(mockSessions);
      expect(result).toHaveLength(2);
      expect(DatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY createdAt DESC'),
        ['user-1']
      );
    });

    it('should return empty array when no sessions found', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rows: []
      });

      const result = await SessionService.findUserActiveSessions('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('deactivateSession', () => {
    it('should deactivate specific session', async () => {
      DatabaseService.query.mockResolvedValueOnce({});

      await SessionService.deactivateSession('sess-123');

      expect(DatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('isActive = false'),
        ['sess-123']
      );
    });

    it('should update timestamp when deactivating', async () => {
      DatabaseService.query.mockResolvedValueOnce({});

      await SessionService.deactivateSession('sess-123');

      const queryCall = DatabaseService.query.mock.calls[0];
      expect(queryCall[0]).toContain('updatedAt = CURRENT_TIMESTAMP');
    });
  });

  describe('deactivateAllUserSessions', () => {
    it('should deactivate all sessions for user', async () => {
      DatabaseService.query.mockResolvedValueOnce({});

      await SessionService.deactivateAllUserSessions('user-1');

      expect(DatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('isActive = false'),
        ['user-1']
      );
    });

    it('should only deactivate active sessions', async () => {
      DatabaseService.query.mockResolvedValueOnce({});

      await SessionService.deactivateAllUserSessions('user-1');

      const queryCall = DatabaseService.query.mock.calls[0];
      expect(queryCall[0]).toContain('isActive = true');
    });
  });

  describe('cleanupExpiredSessions', () => {
    it('should return number of cleaned up sessions', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rowCount: 5
      });

      const result = await SessionService.cleanupExpiredSessions();

      expect(result).toBe(5);
      expect(DatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('expiresAt <= CURRENT_TIMESTAMP')
      );
    });

    it('should return 0 when no sessions to cleanup', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rowCount: 0
      });

      const result = await SessionService.cleanupExpiredSessions();

      expect(result).toBe(0);
    });

    it('should only deactivate expired active sessions', async () => {
      DatabaseService.query.mockResolvedValueOnce({
        rowCount: 3
      });

      await SessionService.cleanupExpiredSessions();

      const queryCall = DatabaseService.query.mock.calls[0];
      expect(queryCall[0]).toContain('expiresAt <= CURRENT_TIMESTAMP');
      expect(queryCall[0]).toContain('isActive = true');
    });
  });
});

