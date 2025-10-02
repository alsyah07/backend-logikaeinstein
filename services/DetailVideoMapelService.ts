import type { Pool } from 'mysql2/promise';
import { dbPool } from './Db';

export interface DetailVideoMapel {
  id_detail_video_mapel: number;
  id_sub_mapel: number;
  tittle: string;
  summary?: string | null;
  banner_video?: string | null;
  video_mapel: string;
  status?: string;
  created_at?: Date;
}

export interface ApiResponse<T> { success: boolean; data?: T; message: string; error?: string; }
export interface CreateDetailVideoRequest {
  id_sub_mapel: number;
  tittle: string;
  summary?: string | null;
  banner_video?: string | null;
  video_mapel: string;
  status?: string;
}

export class DetailVideoMapelService {
  private pool: Pool;
  constructor() { this.pool = dbPool; }

  async getAll(): Promise<ApiResponse<DetailVideoMapel[]>> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM detail_video_mapel ORDER BY id_detail_video_mapel DESC');
      return { success: true, data: rows as DetailVideoMapel[], message: 'OK' };
    } catch (e) {
      return { success: false, message: 'Failed to fetch detail_video_mapel', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async getById(id: number): Promise<ApiResponse<DetailVideoMapel>> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM detail_video_mapel WHERE id_detail_video_mapel = ?', [id]);
      const list = rows as DetailVideoMapel[];
      if (list.length === 0) return { success: false, message: 'Detail video not found' };
      return { success: true, data: list[0], message: 'OK' };
    } catch (e) {
      return { success: false, message: 'Failed to fetch detail video', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async create(payload: CreateDetailVideoRequest): Promise<ApiResponse<{ insertId: number }>> {
    try {
      if (!Number.isInteger(payload.id_sub_mapel) || !payload.tittle || !payload.video_mapel) {
        return { success: false, message: 'id_sub_mapel, tittle, video_mapel are required' };
      }
      const [res] = await this.pool.query(
        'INSERT INTO detail_video_mapel (id_sub_mapel, tittle, summary, banner_video, video_mapel, status) VALUES (?, ?, ?, ?, ?, COALESCE(?, "active"))',
        [payload.id_sub_mapel, payload.tittle, payload.summary ?? null, payload.banner_video ?? null, payload.video_mapel, payload.status]
      );
      return { success: true, data: { insertId: (res as any).insertId }, message: 'Created' };
    } catch (e) {
      return { success: false, message: 'Failed to create detail video', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async update(id: number, payload: Partial<CreateDetailVideoRequest>): Promise<ApiResponse<{}>> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      if (typeof payload.id_sub_mapel === 'number') { fields.push('id_sub_mapel = ?'); values.push(payload.id_sub_mapel); }
      if (payload.tittle !== undefined) { fields.push('tittle = ?'); values.push(payload.tittle); }
      if (payload.summary !== undefined) { fields.push('summary = ?'); values.push(payload.summary); }
      if (payload.banner_video !== undefined) { fields.push('banner_video = ?'); values.push(payload.banner_video); }
      if (payload.video_mapel !== undefined) { fields.push('video_mapel = ?'); values.push(payload.video_mapel); }
      if (payload.status !== undefined) { fields.push('status = ?'); values.push(payload.status); }
      if (fields.length === 0) return { success: false, message: 'No fields to update' };
      values.push(id);
      await this.pool.query(`UPDATE detail_video_mapel SET ${fields.join(', ')} WHERE id_detail_video_mapel = ?`, values);
      return { success: true, message: 'Updated' };
    } catch (e) {
      return { success: false, message: 'Failed to update detail video', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async remove(id: number): Promise<ApiResponse<{}>> {
    try {
      const [res] = await this.pool.query('DELETE FROM detail_video_mapel WHERE id_detail_video_mapel = ?', [id]);
      if ((res as any).affectedRows === 0) return { success: false, message: 'Detail video not found' };
      return { success: true, message: 'Deleted' };
    } catch (e) {
      return { success: false, message: 'Failed to delete detail video', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }
}

export const detailVideoMapelService = new DetailVideoMapelService();

