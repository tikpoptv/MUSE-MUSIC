const { pool } = require('../config/database');
const { logger } = require('../middleware/logger');
const EmailService = require('./emailService');

class AdminManageService {
  static async getAdminUsers() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          userID,
          username,
          email,
          fullName,
          role,
          registerDate,
          createdAt
        FROM Users
        WHERE role IN ('admin', 'super_admin')
        ORDER BY 
          CASE role
            WHEN 'super_admin' THEN 1
            WHEN 'admin' THEN 2
          END,
          createdAt DESC
      `;

      const result = await client.query(query);
      
      return result.rows.map(row => ({
        userID: row.userid,
        username: row.username,
        email: row.email,
        fullName: row.fullname,
        role: row.role,
        registerDate: row.registerdate,
        createdAt: row.createdat
      }));
    } catch (error) {
      logger.error('Error in getAdminUsers:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async addAdminUser(email, role = 'admin') {
    const client = await pool.connect();
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      const validRoles = ['admin', 'super_admin'];
      if (!validRoles.includes(role)) {
        throw new Error('Invalid role. Must be admin or super_admin');
      }

      const findUserQuery = 'SELECT userID, username, email, fullName, role FROM Users WHERE email = $1';
      const findResult = await client.query(findUserQuery, [email.toLowerCase()]);

      if (!findResult.rows || findResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = findResult.rows[0];
      
      if (user.role === 'admin' || user.role === 'super_admin') {
        throw new Error('User is already an admin');
      }

      const updateQuery = `
        UPDATE Users 
        SET role = $1, updatedAt = CURRENT_TIMESTAMP
        WHERE userID = $2
        RETURNING userID, username, email, fullName, role, registerDate, createdAt
      `;

      const updateResult = await client.query(updateQuery, [role, user.userid]);

      const updatedUser = {
        userID: updateResult.rows[0].userid,
        username: updateResult.rows[0].username,
        email: updateResult.rows[0].email,
        fullName: updateResult.rows[0].fullname,
        role: updateResult.rows[0].role,
        registerDate: updateResult.rows[0].registerdate,
        createdAt: updateResult.rows[0].createdat
      };

      try {
        await EmailService.sendAdminPromotionEmail(updatedUser, role);
      } catch (emailError) {
        logger.warn('Failed to send admin promotion email, but admin was added successfully:', emailError);
      }

      return updatedUser;
    } catch (error) {
      logger.error('Error in addAdminUser:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateUserRole(userID, newRole) {
    const client = await pool.connect();
    try {
      if (!userID) {
        throw new Error('User ID is required');
      }

      const validRoles = ['customer', 'admin', 'super_admin'];
      if (!validRoles.includes(newRole)) {
        throw new Error('Invalid role');
      }

      const findUserQuery = 'SELECT userID, role FROM Users WHERE userID = $1';
      const findResult = await client.query(findUserQuery, [userID]);

      if (!findResult.rows || findResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const currentRole = findResult.rows[0].role;
      if (currentRole === newRole) {
        throw new Error('User already has this role');
      }

      const updateQuery = `
        UPDATE Users 
        SET role = $1, updatedAt = CURRENT_TIMESTAMP
        WHERE userID = $2
        RETURNING userID, username, email, fullName, role, registerDate, createdAt
      `;

      const updateResult = await client.query(updateQuery, [newRole, userID]);

      return {
        userID: updateResult.rows[0].userid,
        username: updateResult.rows[0].username,
        email: updateResult.rows[0].email,
        fullName: updateResult.rows[0].fullname,
        role: updateResult.rows[0].role,
        registerDate: updateResult.rows[0].registerdate,
        createdAt: updateResult.rows[0].createdat
      };
    } catch (error) {
      logger.error('Error in updateUserRole:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async removeAdmin(userID) {
    const client = await pool.connect();
    try {
      if (!userID) {
        throw new Error('User ID is required');
      }

      const findUserQuery = 'SELECT userID, role FROM Users WHERE userID = $1';
      const findResult = await client.query(findUserQuery, [userID]);

      if (!findResult.rows || findResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const userRole = findResult.rows[0].role;
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        throw new Error('User is not an admin');
      }

      const updateQuery = `
        UPDATE Users 
        SET role = 'customer', updatedAt = CURRENT_TIMESTAMP
        WHERE userID = $1
        RETURNING userID, username, email, fullName, role, registerDate, createdAt
      `;

      const updateResult = await client.query(updateQuery, [userID]);

      return {
        userID: updateResult.rows[0].userid,
        username: updateResult.rows[0].username,
        email: updateResult.rows[0].email,
        fullName: updateResult.rows[0].fullname,
        role: updateResult.rows[0].role,
        registerDate: updateResult.rows[0].registerdate,
        createdAt: updateResult.rows[0].createdat
      };
    } catch (error) {
      logger.error('Error in removeAdmin:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = AdminManageService;

