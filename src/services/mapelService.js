const pool = require('../config/database');

class MapelService {
  // Get all mapel
  async getall() {
    try {
      const [rows] = await pool.query('SELECT * FROM mapel');
      return {
        success: true,
        data: rows
      };
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  // Get mapel by ID
  async getMapelById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM mapel WHERE id_mapel = ?', [id]);

      if (rows.length === 0) {
        return {
          success: false,
          message: 'Mapel not found'
        };
      }

      return {
        success: true,
        data: rows[0]
      };
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  // Create new mapel
  async createMapel(mapelData) {
    try {
      const { kode_mapel, nama_mapel } = mapelData;

      const [result] = await pool.query(
        'INSERT INTO mapel (kode_mapel, mapel) VALUES (?, ?)',
        [kode_mapel, nama_mapel]
      );

      return {
        success: true,
        message: 'Mapel created successfully',
      };
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  // Update mapel
  async updateMapel(id, mapelData) {
    try {
      const { kode_mapel, nama_mapel } = mapelData;

      const [result] = await pool.query(
        'UPDATE mapel SET kode_mapel = ?, mapel = ? WHERE id_mapel = ?',
        [kode_mapel, nama_mapel, id]
      );

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'Mapel not found'
        };
      }

      return {
        success: true,
        message: 'Mapel updated successfully',
      };
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  // Delete mapel
  async deleteMapel(id) {
    try {
      const [result] = await pool.query('DELETE FROM mapel WHERE id_mapel = ?', [id]);

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'Mapel not found'
        };
      }

      return {
        success: true,
        message: 'Mapel deleted successfully'
      };
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }
}

module.exports = new MapelService();
