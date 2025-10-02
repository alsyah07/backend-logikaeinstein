import type { Pool } from 'mysql2/promise';
import { dbPool } from './Db';

export interface CodeRedeem {
  id_code_redeem: number;
  code_redeem: string;
  id_transaction?: number | null;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  status?: string;
  created_at?: Date;
}

export interface ApiResponse<T> { success: boolean; data?: T; message: string; error?: string; }
export interface CreateCodeRedeemRequest {
  code_redeem: string;
  id_transaction?: number | null;
  start_date: string;
  end_date: string;
  status?: string;
}

export class CodeRedeemService {
  private pool: Pool;
  constructor() { this.pool = dbPool; }

  async getAll(): Promise<ApiResponse<CodeRedeem[]>> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM code_redeem ORDER BY id_code_redeem DESC');
      return { success: true, data: rows as CodeRedeem[], message: 'OK' };
    } catch (e) {
      return { success: false, message: 'Failed to fetch code_redeem', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async getById(id: number): Promise<ApiResponse<CodeRedeem>> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM code_redeem WHERE id_code_redeem = ?', [id]);
      const list = rows as CodeRedeem[];
      if (list.length === 0) return { success: false, message: 'Code redeem not found' };
      return { success: true, data: list[0], message: 'OK' };
    } catch (e) {
      return { success: false, message: 'Failed to fetch code redeem', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async create(payload: CreateCodeRedeemRequest): Promise<ApiResponse<{ insertId: number }>> {
    try {
      if (!payload.code_redeem || !payload.start_date || !payload.end_date) return { success: false, message: 'code_redeem, start_date, end_date are required' };
      const [res] = await this.pool.query(
        'INSERT INTO code_redeem (code_redeem, id_transaction, start_date, end_date, status) VALUES (?, ?, ?, ?, COALESCE(?, "active"))',
        [payload.code_redeem, payload.id_transaction ?? null, payload.start_date, payload.end_date, payload.status]
      );
      return { success: true, data: { insertId: (res as any).insertId }, message: 'Created' };
    } catch (e) {
      return { success: false, message: 'Failed to create code redeem', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async update(id: number, payload: Partial<CreateCodeRedeemRequest>): Promise<ApiResponse<{}>> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      if (payload.code_redeem !== undefined) { fields.push('code_redeem = ?'); values.push(payload.code_redeem); }
      if (typeof payload.id_transaction === 'number' || payload.id_transaction === null) { fields.push('id_transaction = ?'); values.push(payload.id_transaction); }
      if (payload.start_date !== undefined) { fields.push('start_date = ?'); values.push(payload.start_date); }
      if (payload.end_date !== undefined) { fields.push('end_date = ?'); values.push(payload.end_date); }
      if (payload.status !== undefined) { fields.push('status = ?'); values.push(payload.status); }
      if (fields.length === 0) return { success: false, message: 'No fields to update' };
      values.push(id);
      await this.pool.query(`UPDATE code_redeem SET ${fields.join(', ')} WHERE id_code_redeem = ?`, values);
      return { success: true, message: 'Updated' };
    } catch (e) {
      return { success: false, message: 'Failed to update code redeem', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async remove(id: number): Promise<ApiResponse<{}>> {
    try {
      const [res] = await this.pool.query('DELETE FROM code_redeem WHERE id_code_redeem = ?', [id]);
      if ((res as any).affectedRows === 0) return { success: false, message: 'Code redeem not found' };
      return { success: true, message: 'Deleted' };
    } catch (e) {
      return { success: false, message: 'Failed to delete code redeem', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }
}

export const codeRedeemService = new CodeRedeemService();

