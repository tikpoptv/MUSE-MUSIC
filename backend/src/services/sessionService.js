const DatabaseService = require('./databaseService');

class SessionService {
  static async createSession(userID, deviceInfo = 'desktop', ipAddress = null, userAgent = null) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    const query = `
      INSERT INTO UserSessions (userID, deviceInfo, ipAddress, userAgent, expiresAt)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING sessionID, userID, deviceInfo, ipAddress, userAgent, isActive, expiresAt, createdAt
    `;
    
    const values = [userID, deviceInfo, ipAddress, userAgent, expiresAt];
    const result = await DatabaseService.query(query, values);
    
    return result.rows[0];
  }

  static async findActiveSession(sessionID) {
    const query = `
      SELECT sessionID, userID, deviceInfo, ipAddress, userAgent, isActive, expiresAt, createdAt, updatedAt
      FROM UserSessions 
      WHERE sessionID = $1 AND isActive = true AND expiresAt > CURRENT_TIMESTAMP
    `;
    
    const result = await DatabaseService.query(query, [sessionID]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }

  static async findUserActiveSessions(userID) {
    const query = `
      SELECT sessionID, userID, deviceInfo, ipAddress, userAgent, isActive, expiresAt, createdAt, updatedAt
      FROM UserSessions 
      WHERE userID = $1 AND isActive = true AND expiresAt > CURRENT_TIMESTAMP
      ORDER BY createdAt DESC
    `;
    
    const result = await DatabaseService.query(query, [userID]);
    return result.rows;
  }

  static async deactivateSession(sessionID) {
    const query = `
      UPDATE UserSessions 
      SET isActive = false, updatedAt = CURRENT_TIMESTAMP 
      WHERE sessionID = $1
    `;
    
    await DatabaseService.query(query, [sessionID]);
  }

  static async deactivateAllUserSessions(userID) {
    const query = `
      UPDATE UserSessions 
      SET isActive = false, updatedAt = CURRENT_TIMESTAMP 
      WHERE userID = $1 AND isActive = true
    `;
    
    await DatabaseService.query(query, [userID]);
  }

  static async cleanupExpiredSessions() {
    const query = `
      UPDATE UserSessions 
      SET isActive = false, updatedAt = CURRENT_TIMESTAMP 
      WHERE expiresAt <= CURRENT_TIMESTAMP AND isActive = true
    `;
    
    const result = await DatabaseService.query(query);
    return result.rowCount;
  }
}

module.exports = SessionService;
