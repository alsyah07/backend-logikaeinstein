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
        const { id_sub_mapel, tittle, summary, banner_video } = detailVideoMapelData;
        const [result] = await pool.query(
            'INSERT INTO detail_video_mapel (id_sub_mapel, tittle,summary,banner_video) VALUES (?, ?,?,?)',
            [id_sub_mapel, tittle, summary, banner_video]
        );
        return {
            success: true,
            message: 'Detail video mapel created successfully',
            id: result.insertId
        };
    }
    async getDetailVideoMapelByIdSubMapel(id_sub_mapel_detail, id_users) {
        const [rows] = await pool.query(
            'SELECT * FROM detail_video_mapel left join sub_mapel on detail_video_mapel.id_sub_mapel = sub_mapel.id_sub_mapel left join mapel on sub_mapel.id_mapel = mapel.id_mapel WHERE sub_mapel.id_sub_mapel = ? order by detail_video_mapel.id_detail_video_mapel asc',
            [id_sub_mapel_detail]
        );

        // Hitung tanggal saat ini di JavaScript (format MySQL)
        const now = new Date();
        const currentDate = now.toISOString().slice(0, 19).replace('T', ' ');

        // Ambil transaksi yang belum expired
        const [mapel] = await pool.query(
            'SELECT * FROM transaction WHERE transaction.id_users = ? AND expired_date > ?',
            [id_users, currentDate]
        );
        console.log(id_users);

        if (rows.length === 0) {
            return {
                success: false,
                message: 'Detail video mapel not found'
            };
        }
        let redeems = null;
        if (mapel.length === 0) {
            redeems = null;
        } else {
            redeems = mapel[0];
        }
        return {
            success: true,
            data: {
                detail_video_mapel: rows,
                redeem: redeems
            }
        };
    }
    async getDetailVideoMapelByIdSubMapelPembahasan(id_sub_mapel_detail, id_users) {
        const [rows] = await pool.query(
            'SELECT * FROM detail_video_pembahasan left join sub_mapel on detail_video_pembahasan.id_sub_mapel = sub_mapel.id_sub_mapel left join mapel on sub_mapel.id_mapel = mapel.id_mapel WHERE detail_video_pembahasan.id_sub_mapel_detail = ? order by detail_video_pembahasan.id_detail_video_pembahasan desc',
            [id_sub_mapel_detail]
        );

        // Hitung tanggal saat ini di JavaScript (format MySQL)
        const now = new Date();
        const currentDate = now.toISOString().slice(0, 19).replace('T', ' ');

        // Ambil transaksi yang belum expired
        const [mapel] = await pool.query(
            'SELECT * FROM transaction WHERE transaction.id_users = ? AND expired_date > ?',
            [id_users, currentDate]
        );
        console.log(id_users);

        if (rows.length === 0) {
            return {
                success: false,
                message: 'Detail video mapel not found'
            };
        }
        let redeems = null;
        if (mapel.length === 0) {
            redeems = null;
        } else {
            redeems = mapel[0];
        }
        return {
            success: true,
            data: {
                detail_video_mapel: rows,
                redeem: redeems
            }
        };
    }

}

module.exports = new detailVideoMapelService();