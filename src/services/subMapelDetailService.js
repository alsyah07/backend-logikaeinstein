const pool = require('../config/database');

class subMapelDetailService {
  // Get all sub mapel
  async getSubMapelById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM sub_detail_mapel WHERE sub_detail_mapel.id_sub_mapel = ?', [id]);
      if (rows.length === 0) {
        return {
          success: false,
          message: 'Sub mapel not found'
        };
      }
  
      return {
        success: true,
        data: rows
      };
    } catch (error) {
      console.error('Error in getSubMapelById:', error);
      throw error;
    }
  }
}

module.exports = new subMapelDetailService();
