import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

// Type definitions
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  password: string;
  id_role: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserRequest {
  username: string;
  name: string;
  email: string;
  password: string;
  id_role: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    user: User;
    message: string;
  };
  message: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

// Database connection using environment variables
class DatabaseConnection {
  private connection: mysql.Connection | null = null;

  async connect(): Promise<void> {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'logikaeinstein_db'
      });
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.connection) {
      await this.connect();
    }
    
    try {
      const [results] = await this.connection!.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }
}

const db = new DatabaseConnection();

export class UserService {
  /**
   * Get all users from database
   */
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const users = await db.query('SELECT id, username, name, email, id_role, created_at, updated_at FROM users');
      return {
        success: true,
        data: users,
        message: 'Users retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Database query failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<ApiResponse<User>> {
    try {
      const users = await db.query('SELECT id, username, name, email, id_role, created_at, updated_at FROM users WHERE id = ?', [id]);
      
      if (users.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        data: users[0],
        message: 'User retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Database query failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<any>> {
    try {
      
      // Hash password before storing
   
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      console.log('userData', hashedPassword);

      const result = await db.query(
        'INSERT INTO users (username, name, email, password, id_role) VALUES (?, ?, ?, ?, ?)',
        [userData.username, userData.name, userData.email, hashedPassword, userData.id_role]
      );

      return {
        success: true,
        data: result,
        message: 'User created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update user by ID
   */
  async updateUser(id: number, userData: Partial<CreateUserRequest>): Promise<ApiResponse<any>> {
    try {
      // Check if user exists
      const existingUser = await this.getUserById(id);
      if (!existingUser.success) {
        return existingUser;
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (userData.username) {
        updateFields.push('username = ?');
        updateValues.push(userData.username);
      }

      if (userData.name) {
        updateFields.push('name = ?');
        updateValues.push(userData.name);
      }

      if (userData.email) {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
          return {
            success: false,
            message: 'Invalid email format'
          };
        }
        updateFields.push('email = ?');
        updateValues.push(userData.email);
      }

      if (userData.password) {
        // Hash password if provided
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        updateFields.push('password = ?');
        updateValues.push(hashedPassword);
      }

      if (typeof userData.id_role === 'number') {
        updateFields.push('id_role = ?');
        updateValues.push(userData.id_role);
      }

      if (updateFields.length === 0) {
        return {
          success: false,
          message: 'No valid fields to update'
        };
      }

      updateValues.push(id);
      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      
      const result = await db.query(query, updateValues);

      return {
        success: true,
        data: Array.isArray(result) ? result[0] : result,
        message: 'User updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update user',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete user by ID
   */
  async deleteUser(id: number): Promise<ApiResponse<any>> {
    try {
      // Check if user exists
      const existingUser = await this.getUserById(id);
      if (!existingUser.success) {
        return existingUser;
      }

      const result = await db.query('DELETE FROM users WHERE id = ?', [id]);

      return {
        success: true,
        data: Array.isArray(result) ? result[0] : result,
        message: 'User deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete user',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Login user with email and password
   */
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      // Basic validation
      if (!loginData.email || !loginData.password) {
        return {
          success: false,
          message: 'Email and password are required'
        };
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginData.email)) {
        return {
          success: false,
          message: 'Invalid email format'
        };
      }

      // Find user by email
      const users = await db.query('SELECT id, username, name, email, password, id_role, created_at, updated_at FROM users WHERE email = ?', [loginData.email]);
      
      if (users.length === 0) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const user = users[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          message: 'Login successful'
        },
        message: 'Login successful'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const userService = new UserService();