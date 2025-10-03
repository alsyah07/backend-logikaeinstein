const pool = require('../config/database');
const bcrypt = require('bcrypt');

class UserService {
  // Get all users
  async getAllUsers() {
    try {
      const [rows] = await pool.query('SELECT * FROM users');
      return {
        success: true,
        data: rows
      };
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      
      if (rows.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        data: rows[0]
      };
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      const { username, name, email, password, id_role } = userData;
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const [result] = await pool.query(
        'INSERT INTO users (username, name, email, password, id_role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [username, name, email, hashedPassword, id_role || 1]
      );

      return {
        success: true,
        message: 'User created successfully',
        data: {
          id: result.insertId,
          username,
          name,
          email
        }
      };
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(id, userData) {
    try {
      const { username, name, email, password } = userData;
      
      // Jika ada password baru, hash dulu
      let hashedPassword = null;
      if (password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
      }
      
      // Build query dinamis
      let query = 'UPDATE users SET username = ?, name = ?, email = ?';
      let params = [username, name, email];
      
      if (hashedPassword) {
        query += ', password = ?';
        params.push(hashedPassword);
      }
      
      query += ', updated_at = NOW() WHERE id = ?';
      params.push(id);
      
      const [result] = await pool.query(query, params);

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        message: 'User updated successfully',
        data: { id, username, name, email }
      };
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(id) {
    try {
      const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }

  // Login
  async loginUser(email, password) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      
      if (rows.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid password'
        };
      }

      // Jangan return password
      delete user.password;

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: user
        }
      };
    } catch (error) {
      console.error('Error in loginUser:', error);
      throw error;
    }
  }
}

module.exports = new UserService();