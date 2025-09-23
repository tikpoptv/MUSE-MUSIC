const { pool } = require('../config/database');

class DatabaseService {
  static async query(text, params = []) {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('\x1b[90m📊 Query executed:\x1b[0m', { text, duration: `${duration}ms`, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error('\x1b[31m❌ Query error:\x1b[0m', error.message);
      throw error;
    }
  }

  static async findOne(table, conditions = {}, columns = '*') {
    const whereClause = Object.keys(conditions).length > 0 
      ? `WHERE ${Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`).join(' AND ')}`
      : '';
    
    const query = `SELECT ${columns} FROM ${table} ${whereClause} LIMIT 1`;
    const values = Object.values(conditions);
    
    const result = await this.query(query, values);
    return result.rows[0] || null;
  }

  static async findMany(table, conditions = {}, columns = '*', options = {}) {
    const whereClause = Object.keys(conditions).length > 0 
      ? `WHERE ${Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`).join(' AND ')}`
      : '';
    
    let query = `SELECT ${columns} FROM ${table} ${whereClause}`;
    const values = Object.values(conditions);
    
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    }
    
    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
    }
    
    if (options.offset) {
      query += ` OFFSET ${options.offset}`;
    }
    
    const result = await this.query(query, values);
    return result.rows;
  }

  static async insert(table, data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, index) => `$${index + 1}`).join(', ');
    const values = Object.values(data);
    
    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.query(query, values);
    return result.rows[0];
  }

  static async update(table, data, conditions) {
    const setClause = Object.keys(data).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const whereClause = Object.keys(conditions).map((key, index) => `${key} = $${index + Object.keys(data).length + 1}`).join(' AND ');
    
    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
    const values = [...Object.values(data), ...Object.values(conditions)];
    
    const result = await this.query(query, values);
    return result.rows[0];
  }

  static async delete(table, conditions) {
    const whereClause = Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const query = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;
    const values = Object.values(conditions);
    
    const result = await this.query(query, values);
    return result.rows[0];
  }

  static async count(table, conditions = {}) {
    const whereClause = Object.keys(conditions).length > 0 
      ? `WHERE ${Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`).join(' AND ')}`
      : '';
    
    const query = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;
    const values = Object.values(conditions);
    
    const result = await this.query(query, values);
    return parseInt(result.rows[0].count);
  }

  static async exists(table, conditions) {
    const result = await this.findOne(table, conditions, '1');
    return result !== null;
  }

  static async transaction(callback) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = DatabaseService;
