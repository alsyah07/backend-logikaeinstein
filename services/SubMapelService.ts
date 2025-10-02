import type { Pool } from 'mysql2/promise';
import { dbPool } from './Db';

export interface SubMapel {
  id_sub_mapel: number;
  id_mapel: number;
  sub_mapel: string;
  status?: string;
  created_at?: Date;
}

export interface ApiResponse<T> { success: boolean; data?: T; message: string; error?: string; }
export interface CreateSubMapelRequest { id_mapel: number; sub_mapel: string; status?: string; }

export class SubMapelService {
  private pool: Pool;
  constructor() { this.pool = dbPool; }

  async getAll(): Promise<ApiResponse<SubMapel[]>> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM sub_mapel ORDER BY id_sub_mapel DESC');
      return { success: true, data: rows as SubMapel[], message: 'OK' };
    } catch (e) {
      return { success: false, message: 'Failed to fetch sub_mapel', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async getById(id: number): Promise<ApiResponse<SubMapel>> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM sub_mapel WHERE id_sub_mapel = ?', [id]);
      const list = rows as SubMapel[];
      if (list.length === 0) return { success: false, message: 'Sub mapel not found' };
      return { success: true, data: list[0], message: 'OK' };
    } catch (e) {
      return { success: false, message: 'Failed to fetch sub_mapel', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async create(payload: CreateSubMapelRequest): Promise<ApiResponse<{ insertId: number }>> {
    try {
      if (!Number.isInteger(payload.id_mapel) || !payload.sub_mapel) return { success: false, message: 'id_mapel and sub_mapel are required' };
      const [res] = await this.pool.query('INSERT INTO sub_mapel (id_mapel, sub_mapel, status) VALUES (?, ?, COALESCE(?, "active"))', [payload.id_mapel, payload.sub_mapel, payload.status]);
      return { success: true, data: { insertId: (res as any).insertId }, message: 'Created' };
    } catch (e) {
      return { success: false, message: 'Failed to create sub_mapel', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async update(id: number, payload: Partial<CreateSubMapelRequest>): Promise<ApiResponse<{}>> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      if (typeof payload.id_mapel === 'number') { fields.push('id_mapel = ?'); values.push(payload.id_mapel); }
      if (payload.sub_mapel !== undefined) { fields.push('sub_mapel = ?'); values.push(payload.sub_mapel); }
      if (payload.status !== undefined) { fields.push('status = ?'); values.push(payload.status); }
      if (fields.length === 0) return { success: false, message: 'No fields to update' };
      values.push(id);
      await this.pool.query(`UPDATE sub_mapel SET ${fields.join(', ')} WHERE id_sub_mapel = ?`, values);
      return { success: true, message: 'Updated' };
    } catch (e) {
      return { success: false, message: 'Failed to update sub_mapel', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async remove(id: number): Promise<ApiResponse<{}>> {
    try {
      const [res] = await this.pool.query('DELETE FROM sub_mapel WHERE id_sub_mapel = ?', [id]);
      if ((res as any).affectedRows === 0) return { success: false, message: 'Sub mapel not found' };
      return { success: true, message: 'Deleted' };
    } catch (e) {
      return { success: false, message: 'Failed to delete sub_mapel', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }
}

export const subMapelService = new SubMapelService();

