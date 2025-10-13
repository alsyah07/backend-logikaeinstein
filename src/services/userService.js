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
      const { username, name, email, password, id_role, phone } = userData;
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const [result] = await pool.query(
        'INSERT INTO users (username, name, email, password, id_role, no_hp, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [username, name, email, hashedPassword, id_role || 1, phone || null]
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
      const { username, name, email, password, no_hp } = userData;
      
      // Jika ada password baru, hash dulu
      let hashedPassword = null;
      if (password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
      }
      
      // Build query dinamis
      let query = 'UPDATE users SET username = ?, name = ?, email = ?, no_hp = ?';
      let params = [username, name, email, no_hp || null];
      
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

  // Handle change password
  async handleChangePassword(id, passwordData) {
    try {
      const { currentPassword, newPassword } = passwordData;
      console.log('currentPassword',currentPassword,newPassword)
      if (!currentPassword || !newPassword) {
        return {
          success: false,
          message: 'Current password and new password are required'
        };
      }

      // Cari user by ID
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      if (rows.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const user = rows[0];
      console.log('user',user)

      // Hash password baru (atau gunakan langsung jika sudah bcrypt-hash)
      const saltRounds = 10;
      const bcryptHashRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
      const hashedNewPassword = bcryptHashRegex.test(newPassword)
        ? newPassword
        : await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const [result] = await pool.query(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedNewPassword, id]
      );

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'Failed to update password'
        };
      }

      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      console.error('Error in handleChangePassword:', error);
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