const { pool } = require('../config/database');

class LogService {
  static get logQueue() {
    if (!this._logQueue) {
      this._logQueue = [];
    }
    return this._logQueue;
  }

  static get isProcessing() {
    return this._isProcessing || false;
  }

  static set isProcessing(value) {
    this._isProcessing = value;
  }

  static get BATCH_SIZE() {
    return 10;
  }

  static get BATCH_INTERVAL() {
    return 5000;
  }

  static async saveLog(logData) {
    this.logQueue.push({
      ...logData,
      createdAt: new Date()
    });

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  static async processQueue() {
    if (this.isProcessing || this.logQueue.length === 0) return;
    
    this.isProcessing = true;
    
    try {
      const batch = this.logQueue.splice(0, this.BATCH_SIZE);
      
      if (batch.length > 0) {
        await this.batchInsert(batch);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save logs to database:', error);
    } finally {
      this.isProcessing = false;
      
      if (this.logQueue.length > 0) {
        setTimeout(() => this.processQueue(), this.BATCH_INTERVAL);
      }
    }
  }

  static async batchInsert(logs) {
    const client = await pool.connect();
    try {
      if (logs.length === 0) return;

      const values = logs.map((log, index) => {
        const base = index * 15;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14}, $${base + 15})`;
      }).join(', ');

      const params = logs.flatMap(log => [
        log.level || 'info',
        log.category || null,
        log.message || '',
        log.details ? JSON.stringify(log.details) : null,
        log.method || null,
        log.path || null,
        log.statusCode || null,
        log.userID || null,
        log.userRole || null,
        log.ipAddress || null,
        log.userAgent || null,
        log.requestID || null,
        log.errorStack || null,
        log.errorCode || null,
        log.duration || null
      ]);

      const query = `
        INSERT INTO systemlogs (
          level, category, message, details, method, path, statuscode,
          userid, userrole, ipaddress, useragent, requestid,
          errorstack, errorcode, duration
        ) VALUES ${values}
      `;

      await client.query(query, params);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in batchInsert logs:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getLogs(filters = {}) {
    const client = await pool.connect();
    try {
      const {
        level, category, userID, startDate, endDate,
        search, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'DESC'
      } = filters;

      const whereConditions = [];
      const queryParams = [];
      let paramIndex = 1;

      if (level) {
        whereConditions.push(`level = $${paramIndex++}`);
        queryParams.push(level);
      }
      if (category) {
        whereConditions.push(`category = $${paramIndex++}`);
        queryParams.push(category);
      }
      if (userID) {
        whereConditions.push(`userid = $${paramIndex++}`);
        queryParams.push(userID);
      }
      if (startDate) {
        whereConditions.push(`createdat >= $${paramIndex++}`);
        queryParams.push(startDate);
      }
      if (endDate) {
        whereConditions.push(`createdat <= $${paramIndex++}`);
        queryParams.push(endDate);
      }
      if (search) {
        whereConditions.push(`message ILIKE $${paramIndex++}`);
        queryParams.push(`%${search}%`);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      const offset = (page - 1) * limit;
      const validSortBy = ['createdat', 'level', 'category', 'message'];
      const sortField = validSortBy.includes(sortBy.toLowerCase()) 
        ? sortBy.toLowerCase() 
        : 'createdat';
      const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const query = `
        SELECT 
          logid, level, category, message, details, method, path, statuscode,
          userid, userrole, ipaddress, useragent, requestid,
          errorstack, errorcode, duration, createdat
        FROM systemlogs
        ${whereClause}
        ORDER BY ${sortField} ${validSortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);

      const countQuery = `
        SELECT COUNT(*) as total
        FROM systemlogs
        ${whereClause}
      `;

      const [result, countResult] = await Promise.all([
        client.query(query, queryParams),
        client.query(countQuery, queryParams.slice(0, -2))
      ]);

      return {
        logs: result.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].total),
          totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
        }
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in getLogs:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getLogStats() {
    const client = await pool.connect();
    try {
      const statsQuery = `
        SELECT 
          level,
          COUNT(*) as count
        FROM systemlogs
        WHERE createdat >= NOW() - INTERVAL '24 hours'
        GROUP BY level
      `;

      const errorQuery = `
        SELECT COUNT(*) as count
        FROM systemlogs
        WHERE level = 'error'
          AND createdat >= NOW() - INTERVAL '24 hours'
      `;

      const apiCallsQuery = `
        SELECT COUNT(*) as count
        FROM systemlogs
        WHERE category = 'api'
          AND createdat >= NOW() - INTERVAL '24 hours'
      `;

      const [statsResult, errorResult, apiCallsResult] = await Promise.all([
        client.query(statsQuery),
        client.query(errorQuery),
        client.query(apiCallsQuery)
      ]);

      return {
        byLevel: statsResult.rows.reduce((acc, row) => {
          acc[row.level] = parseInt(row.count);
          return acc;
        }, {}),
        errorCount: parseInt(errorResult.rows[0]?.count || 0),
        apiCallsCount: parseInt(apiCallsResult.rows[0]?.count || 0)
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in getLogStats:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = LogService;

