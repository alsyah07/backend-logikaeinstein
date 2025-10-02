import mysql from 'mysql2/promise';

export class DatabasePool {
  private static pool: mysql.Pool | null = null;

  static getPool(): mysql.Pool {
    if (!DatabasePool.pool) {
      DatabasePool.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'e_learning',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: true
      });
    }
    return DatabasePool.pool;
  }
}

export const dbPool = DatabasePool.getPool();

