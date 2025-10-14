const { pool } = require('../config/database');

class UserSettingsService {
  static async getUserSettings(userID) {
    const query = `
      SELECT 
        u.userID,
        u.username,
        u.email,
        u.fullName,
        u.profilePicture,
        u.provider,
        c.country,
        c.timezone,
        c.preferredLanguage as language
      FROM Users u
      LEFT JOIN Customers c ON u.userID = c.userID
      WHERE u.userID = $1
    `;

    const result = await pool.query(query, [userID]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    
    return {
      username: user.username,
      email: user.email,
      fullName: user.fullname,
      profilePicture: user.profilepicture,
      country: user.country || '',
      timezone: user.timezone || '',
      language: user.language || '',
      provider: user.provider
    };
  }

  static async updateUserSettings(userID, settingsData) {
    const { username, email, fullName, country, timezone, language } = settingsData;
    
    const userQuery = `
      UPDATE Users 
      SET username = $1, email = $2, fullName = $3, updatedAt = CURRENT_TIMESTAMP
      WHERE userID = $4
    `;
    
    await pool.query(userQuery, [username, email, fullName, userID]);
    const customerQuery = `
      INSERT INTO Customers (userID, country, timezone, preferredLanguage, createdAt, updatedAt)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (userID) 
      DO UPDATE SET 
        country = $2, 
        timezone = $3, 
        preferredLanguage = $4, 
        updatedAt = CURRENT_TIMESTAMP
    `;
    
    await pool.query(customerQuery, [userID, country, timezone, language]);
    
    return true;
  }
}

module.exports = UserSettingsService;
