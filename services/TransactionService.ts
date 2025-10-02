import type { Pool } from 'mysql2/promise';
import { dbPool } from './Db';

export interface Transaction {
  id_transaction: number;
  id_detail_video_mapel: number;
  id_users: number;
  code_redeem?: string | null;
  date: string; // YYYY-MM-DD
  status?: string;
  created_at?: Date;
}

export interface ApiResponse<T> { success: boolean; data?: T; message: string; error?: string; }
export interface CreateTransactionRequest {
  id_detail_video_mapel: number;
  id_users: number;
  code_redeem?: string | null;
  date: string; // YYYY-MM-DD
  status?: string;
}

export class TransactionService {
  private pool: Pool;
  constructor() { this.pool = dbPool; }

  async getAll(): Promise<ApiResponse<Transaction[]>> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM `transaction` ORDER BY id_transaction DESC');
      return { success: true, data: rows as Transaction[], message: 'OK' };
    } catch (e) {
      return { success: false, message: 'Failed to fetch transactions', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async getById(id: number): Promise<ApiResponse<Transaction>> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM `transaction` WHERE id_transaction = ?', [id]);
      const list = rows as Transaction[];
      if (list.length === 0) return { success: false, message: 'Transaction not found' };
      return { success: true, data: list[0], message: 'OK' };
    } catch (e) {
      return { success: false, message: 'Failed to fetch transaction', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async create(payload: CreateTransactionRequest): Promise<ApiResponse<{ insertId: number }>> {
    try {
      if (!Number.isInteger(payload.id_detail_video_mapel) || !Number.isInteger(payload.id_users) || !payload.date) {
        return { success: false, message: 'id_detail_video_mapel, id_users, date are required' };
      }
      const [res] = await this.pool.query(
        'INSERT INTO `transaction` (id_detail_video_mapel, id_users, code_redeem, date, status) VALUES (?, ?, ?, ?, COALESCE(?, "pending"))',
        [payload.id_detail_video_mapel, payload.id_users, payload.code_redeem ?? null, payload.date, payload.status]
      );
      return { success: true, data: { insertId: (res as any).insertId }, message: 'Created' };
    } catch (e) {
      return { success: false, message: 'Failed to create transaction', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async update(id: number, payload: Partial<CreateTransactionRequest>): Promise<ApiResponse<{}>> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      if (typeof payload.id_detail_video_mapel === 'number') { fields.push('id_detail_video_mapel = ?'); values.push(payload.id_detail_video_mapel); }
      if (typeof payload.id_users === 'number') { fields.push('id_users = ?'); values.push(payload.id_users); }
      if (payload.code_redeem !== undefined) { fields.push('code_redeem = ?'); values.push(payload.code_redeem); }
      if (payload.date !== undefined) { fields.push('date = ?'); values.push(payload.date); }
      if (payload.status !== undefined) { fields.push('status = ?'); values.push(payload.status); }
      if (fields.length === 0) return { success: false, message: 'No fields to update' };
      values.push(id);
      await this.pool.query(`UPDATE \`transaction\` SET ${fields.join(', ')} WHERE id_transaction = ?`, values);
      return { success: true, message: 'Updated' };
    } catch (e) {
      return { success: false, message: 'Failed to update transaction', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async remove(id: number): Promise<ApiResponse<{}>> {
    try {
      const [res] = await this.pool.query('DELETE FROM `transaction` WHERE id_transaction = ?', [id]);
      if ((res as any).affectedRows === 0) return { success: false, message: 'Transaction not found' };
      return { success: true, message: 'Deleted' };
    } catch (e) {
      return { success: false, message: 'Failed to delete transaction', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }
}

export const transactionService = new TransactionService();

