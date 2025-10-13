const pool = require('../config/database');
const bcrypt = require('bcrypt');

class UserService {

  async getRedeemUsersById(code_redeem, id_user) {
    try {
      let rows;
      if (id_user) {
        [rows] = await pool.query(
          'SELECT * FROM transaction WHERE code_redeem = ? AND id_users = ?',
          [code_redeem, id_user]
        );
      } else {
        [rows] = await pool.query(
          'SELECT * FROM transaction WHERE code_redeem = ?',
          [code_redeem]
        );
      }

      if (rows.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Update status_redeem menjadi 1 untuk kode yang cocok
      if (id_user) {
        await pool.query(
          'UPDATE transaction SET status_redeem = 1, status="success", updated_at = NOW() WHERE code_redeem = ? AND id_users = ?',
          [code_redeem, id_user]
        );
      } else {
        await pool.query(
          'UPDATE transaction SET status_redeem = 1, status="success", updated_at = NOW() WHERE code_redeem = ?',
          [code_redeem]
        );
      }

      const updated = rows[0];
      updated.status_redeem = 1;

      return {
        success: true,
        data: updated
      };
    } catch (error) {
      console.error('Error in getRedeemUsersById:', error);
      throw error;
    }
  }

  async createRedeemUsers(redeemUsersData) {
    try {
      const { id_users, code_redeem } = redeemUsersData;

      const existsInDb = async (code) => {
        const [rows] = await pool.query(
          'SELECT 1 FROM transaction WHERE code_redeem = ? LIMIT 1',
          [code]
        );
        return rows.length > 0;
      };

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

        const rand6 = Math.floor(100000 + Math.random() * 900000); // 6 digit
        const letters = Array.from({ length: 3 }, () =>
          String.fromCharCode(65 + Math.floor(Math.random() * 26))
        ).join(''); // huruf acak 3 karakter

        // Format: RD-<huruf>-<id_users>-<YYYYMMDDHHmmss>-<6digit>
        return `RD-${letters}-${id_users}-${ts}-${rand6}`;
      };

      // Jika code_redeem dikirim dan belum dipakai, gunakan; jika tidak/duplikat, generate baru
      let finalCode =
        code_redeem && !(await existsInDb(code_redeem)) ? code_redeem : generateCode();

      // Pastikan tidak duplikat (loop sampai unik)
      while (await existsInDb(finalCode)) {
        finalCode = generateCode();
      }

      const [result] = await pool.query(
        'INSERT INTO transaction (id_users, code_redeem, date, created_at, updated_at) VALUES (?, ?, NOW(), NOW(), NOW())',
        [id_users, finalCode]
      );

      return {
        success: true,
        message: 'Redeem users created successfully',
        data: { id: result.insertId, id_users, code_redeem: finalCode }
      };
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
}

module.exports = new UserService();