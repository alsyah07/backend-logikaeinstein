const pool = require('../config/database');
const bcrypt = require('bcrypt');

class UserService {

  async getRedeemUsersById(code_redeem, id_user) {
    try {
      // Hitung tanggal untuk validasi expired
      const now = new Date();
      const currentDate = now.toISOString().slice(0, 19).replace('T', ' ');
      const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      // Cek kode di code_redeem tanpa filter status dulu
      const [codeRows] = await pool.query(
        'SELECT * FROM code_redeem WHERE code_redeem = ? LIMIT 1',
        [code_redeem]
      );
      if (codeRows.length === 0) {
        return { success: false, message: 'Code not found' };
      }
      const codeRec = codeRows[0];

      // Jika status = 1, maka kode sudah digunakan dan tidak bisa dipakai
      if (codeRec.status === 1) {
        return { success: false, message: 'Code already used' };
      }

      // Validasi transaksi dan masa berlaku
      const selectQuery = id_user
        ? 'SELECT * FROM transaction WHERE code_redeem = ? AND id_users = ? AND expired_date > ? LIMIT 1'
        : 'SELECT * FROM transaction WHERE code_redeem = ? AND expired_date > ? LIMIT 1';
      const selectParams = id_user
        ? [code_redeem, id_user, currentDate]
        : [code_redeem, currentDate];

      const [trxRows] = await pool.query(selectQuery, selectParams);
      if (trxRows.length === 0) {
        return { success: false, message: 'Transaction not found or code expired' };
      }
      const trx = trxRows[0];

      // Update transaksi: set status redeem + refresh masa berlaku (start_date & expired_date)
      const updateQuery = id_user
        ? 'UPDATE transaction SET status_redeem = 1, status = "success", start_date = ?, expired_date = ?, updated_at = ? WHERE id_transaction = ? AND id_users = ?'
        : 'UPDATE transaction SET status_redeem = 1, status = "success", start_date = ?, expired_date = ?, updated_at = ? WHERE id_transaction = ?';
      const updateParams = id_user
        ? [currentDate, nextYear, currentDate, trx.id_transaction, id_user]
        : [currentDate, nextYear, currentDate, trx.id_transaction];

      await pool.query(updateQuery, updateParams);

      // Tandai kode di code_redeem sebagai digunakan dan kaitkan ke transaksi
      await pool.query(
        'UPDATE code_redeem SET status = 1, id_transaction = ?, updated_at = ? WHERE code_redeem = ?',
        [trx.id_transaction, currentDate, code_redeem]
      );

      return {
        success: true,
        data: {
          ...trx,
          status_redeem: 1,
          start_date: currentDate,
          expired_date: nextYear,
          status: 'success'
        }
      };
    } catch (error) {
      console.error('Error in getRedeemUsersById:', error);
      throw error;
    }
  }

  async createRedeemUsers(redeemUsersData) {
    try {
      const { id_users, code_redeem } = redeemUsersData;
     // console.log(id_users, code_redeem);

        const [rows] = await pool.query(
          'SELECT * FROM code_redeem WHERE code_redeem = ? LIMIT 1',
          [code_redeem]
        );
        const row = rows[0];
       // console.log(row.code_redeem);
        if(row.code_redeem !== null) {
          const now = new Date();
          const startDate = now.toISOString().slice(0, 19).replace('T', ' ');
          const endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');

          const [trx] = await pool.query(
            'INSERT INTO transaction (id_users, code_redeem, date, status, start_date, expired_date, created_at, updated_at) VALUES (?, ?, NOW(), "success", ?, ?, NOW(), NOW())',
            [id_users, code_redeem, startDate, endDate]
          );
          const [rowUpdate] = await pool.query(
            'UPDATE code_redeem SET status = 1, id_users = ? WHERE code_redeem = ?',
            [id_users, code_redeem]
          );
          return {
            success: true,
            code:200,
            message: 'Redeem users created successfully',
          };
        }
    } catch (error) {
      console.error('Error in createRedeemUsers:', error);
      throw error;
    }
  }
  async getAllRedeemUsers(id, no_hp) {
    try {
      const id_users = id;

      // Cek duplikasi kode di DB
      const existsInDb = async (code) => {
        const [rows] = await pool.query(
          'SELECT 1 FROM transaction WHERE code_redeem = ? LIMIT 1',
          [code]
        );
        return rows.length > 0;
      };

      // Generator kode: RD-<huruf>-<id_users>-<YYYYMMDDHHmmss>-<6digit>
      const generateCode = () => {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const yyyy = now.getFullYear();
        const MM = pad(now.getMonth() + 1);
        const dd = pad(now.getDate());
        const HH = pad(now.getHours());
        const mm = pad(now.getMinutes());
        const ss = pad(now.getSeconds());
        const ts = `${yyyy}${MM}${dd}${HH}${mm}${ss}`;

        const rand6 = Math.floor(100000 + Math.random() * 900000);
        const letters = Array.from({ length: 3 }, () =>
          String.fromCharCode(65 + Math.floor(Math.random() * 26))
        ).join('');

        return `RD-${letters}-${id_users}-${ts}-${rand6}`;
      };

      // Pastikan kode unik
      let finalCode = generateCode();
      while (await existsInDb(finalCode)) {
        finalCode = generateCode();
      }

      // Insert transaksi baru
      const [insert] = await pool.query(
        'INSERT INTO transaction (id_users, code_redeem, date, created_at, updated_at) VALUES (?, ?, NOW(), NOW(), NOW())',
        [id_users, finalCode]
      );

      // Ambil transaksi yang baru dibuat
      const [rows] = await pool.query(
        'SELECT * FROM transaction WHERE id_transaction = ?',
        [insert.insertId]
      );

      if (rows.length === 0) {
        return {
          success: false,
          message: 'No redeem users found for this code'
        };
      }

      // Ambil data user by id_users
      const [datausers] = await pool.query(
        'SELECT id, name, email, no_hp FROM users WHERE id = ?',
        [id_users]
      );

      if (datausers.length === 0) {
        return {
          success: false,
          message: 'User not found with this id'
        };
      }

      // Kirim pesan via Fonnte
      let fonnte;
      const token = process.env.TOKEN_FONNTE;
      const targetHp = no_hp || datausers[0].no_hp;

      if (token && targetHp) {
        const https = require('https');
        const payload = {
          target: targetHp,
          message: `✅ Pembayaran Berhasil!
        👋 Halo ${datausers[0].name || 'Pengguna'},

        Terima kasih telah melakukan pembayaran. Berikut detail transaksi Anda:
        - 👤 Nama: ${datausers[0].name || '-'}
        - 📧 Email: ${datausers[0].email || '-'}

        *🔒 KODE REDEEM:*
        \`\`\`
        ${rows[0].code_redeem}
        \`\`\`

        📘 Silakan gunakan kode redeem di aplikasi untuk mengakses materi.
        🙏 Terima kasih telah mempercayai Logika Einstein.
        🧠 Butuh bantuan? Balas pesan ini untuk menghubungi kami.`
        };
        const options = {
          hostname: 'api.fonnte.com',
          path: '/send',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        };
        const sendFonnte = () =>
          new Promise((resolve, reject) => {
            const req = https.request(options, res => {
              let data = '';
              res.on('data', chunk => (data += chunk));
              res.on('end', () => {
                try {
                  resolve(JSON.parse(data));
                } catch {
                  resolve({ raw: data });
                }
              });
            });
            req.on('error', reject);
            req.write(JSON.stringify(payload));
            req.end();
          });

        try {
          const resp = await sendFonnte();
          fonnte = { sent: true, target: targetHp, response: resp };
        } catch (err) {
          fonnte = { sent: false, error: err.message };
        }
      } else {
        fonnte = { sent: false, reason: token ? 'No targets (no_hp) found' : 'Missing TOKEN_FONNTE env' };
      }

      return {
        success: true,
        data: rows,
        fonnte
      };
    } catch (error) {
      console.error('Error in getAllRedeemUsers:', error);
      throw error;
    }
  }
  async getAllCodeRedeem() {
    try {
      const [rows] = await pool.query('SELECT * FROM code_redeem WHERE status IS NULL LIMIT 100');
      return {
        success: true,
        data: rows
      };
    } catch (error) {
      console.error('Error in getAllCodeRedeem:', error);
      throw error;
    }
  }
}

module.exports = new UserService();