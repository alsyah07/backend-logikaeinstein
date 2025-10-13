const pool = require('../config/database.js');

class detailVideoMapelService {
    async getAllDetailVideoMapel() {
        const [rows] = await pool.query(
            'SELECT * FROM detail_video_mapel left join sub_mapel on detail_video_mapel.id_sub_mapel = sub_mapel.id_sub_mapel left join mapel on sub_mapel.id_mapel = mapel.id_mapel'
        );
        return rows;
    }
    async getDetailVideoMapelById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM detail_video_mapel left join sub_mapel on detail_video_mapel.id_sub_mapel = sub_mapel.id_sub_mapel left join mapel on sub_mapel.id_mapel = mapel.id_mapel WHERE detail_video_mapel.id_detail_video_mapel = ?',
            [id]
        );
        return rows;
    }
    async createDetailVideoMapel(detailVideoMapelData) {
        const { id_sub_mapel, tittle,summary,banner_video } = detailVideoMapelData;
        const [result] = await pool.query(
            'INSERT INTO detail_video_mapel (id_sub_mapel, tittle,summary,banner_video) VALUES (?, ?,?,?)',
            [id_sub_mapel, tittle,summary,banner_video]
        );
        return {
            success: true,
            message: 'Detail video mapel created successfully',
            id: result.insertId
        };
    }
    async getDetailVideoMapelByIdSubMapel(id_sub_mapel,id_users) {
        const [rows] = await pool.query(
            'SELECT * FROM detail_video_mapel left join sub_mapel on detail_video_mapel.id_sub_mapel = sub_mapel.id_sub_mapel left join mapel on sub_mapel.id_mapel = mapel.id_mapel WHERE detail_video_mapel.id_sub_mapel = ?',
            [id_sub_mapel]
        );
        const [mapel] = await pool.query(
            'SELECT * FROM transaction WHERE transaction.id_users = ?',
            [id_users]
        );
        if (rows.length === 0) {
            return {
                success: false,
                message: 'Detail video mapel not found'
            };
        }
        return {
            success: true,
            data: {
                detail_video_mapel: rows,
                redeem: mapel[0]
            }
        };
    }
}

module.exports = new detailVideoMapelService();