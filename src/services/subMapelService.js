const pool = require('../config/database');

class subMapelService {
  // Get all sub mapel
  async serviceall() {
    try {
      const [rows] = await pool.query('SELECT * FROM sub_mapel LEFT JOIN mapel ON sub_mapel.id_mapel = mapel.id_mapel order by sub_mapel.orderby ASC');
      return {
        success: true,
        data: rows
      };
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }
  async getSubMapelById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM sub_mapel LEFT JOIN mapel ON sub_mapel.id_mapel = mapel.id_mapel WHERE sub_mapel.id_sub_mapel = ? ORDER BY sub_mapel.orderby ASC', [id]);
      const [mapel] = await pool.query('SELECT * FROM working_hours WHERE id_working_hours = ?', [rows[0].id_working_hours]);
      
      if (rows.length === 0) {
        return {
          success: false,
          message: 'Sub mapel not found'
        };
      }
      return {
        success: true,
        data: rows,
        mapel: mapel[0]
      };
    } catch (error) {
      console.error('Error in getSubMapelById:', error);
      throw error;
    }
  }
  async createSubMapel(id_mapel, sub_mapel) {
    try {
      const [result] = await pool.query(
        'INSERT INTO sub_mapel (id_mapel, sub_mapel) VALUES (?, ?)',
        [id_mapel, sub_mapel]
      );
      return {
        success: true,
        message: 'Sub mapel created successfully',
        id: result.insertId
      };
    } catch (error) {
      console.error('Error in createSubMapel:', error);
      throw error;
    }
  }
  async updateSubMapel(id, id_mapel, sub_mapel) {
    try {
      const [result] = await pool.query(
        'UPDATE sub_mapel SET id_mapel = ?, sub_mapel = ? WHERE id_sub_mapel = ?',
        [id_mapel, sub_mapel, id]
      );
      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'Sub mapel not found'
        };
      }
      return {
        success: true,
        message: 'Sub mapel updated successfully'
      };
    } catch (error) {
      console.error('Error in updateSubMapel:', error);
      throw error;
    }
  }
  async deleteSubMapel(id) {
    try {
      const [result] = await pool.query('DELETE FROM sub_mapel WHERE id_sub_mapel = ?', [id]);
      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'Sub mapel not found'
        };
      }
      return {
        success: true,
        message: 'Sub mapel deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteSubMapel:', error);
      throw error;
    }
  }
}

module.exports = new subMapelService();
