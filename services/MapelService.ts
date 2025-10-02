import type { Pool } from 'mysql2/promise';
import { dbPool } from './Db';

export interface Mapel {
  id_mapel: number;
  mapel: string;
  status?: string;
  created_at?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface CreateMapelRequest {
  mapel: string;
  status?: string;
}

export class MapelService {
  private pool: Pool;
  constructor() { this.pool = dbPool; }

  async getAll(): Promise<ApiResponse<Mapel[]>> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM mapel ORDER BY id_mapel DESC');
      return { success: true, data: rows as Mapel[], message: 'OK' };
    } catch (e) {
      return { success: false, message: 'Failed to fetch mapel', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async getById(id: number): Promise<ApiResponse<Mapel>> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM mapel WHERE id_mapel = ?', [id]);
      const list = rows as Mapel[];
      if (list.length === 0) return { success: false, message: 'Mapel not found' };
      return { success: true, data: list[0], message: 'OK' };
    } catch (e) {
      return { success: false, message: 'Failed to fetch mapel', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async create(payload: CreateMapelRequest): Promise<ApiResponse<{ insertId: number }>> {
    try {
      if (!payload.mapel || payload.mapel.trim() === '') return { success: false, message: 'mapel is required' };
      const [res] = await this.pool.query('INSERT INTO mapel (mapel, status) VALUES (?, COALESCE(?, "active"))', [payload.mapel, payload.status]);
      return { success: true, data: { insertId: (res as any).insertId }, message: 'Created' };
    } catch (e) {
      return { success: false, message: 'Failed to create mapel', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async update(id: number, payload: Partial<CreateMapelRequest>): Promise<ApiResponse<{}>> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      if (payload.mapel !== undefined) { fields.push('mapel = ?'); values.push(payload.mapel); }
      if (payload.status !== undefined) { fields.push('status = ?'); values.push(payload.status); }
      if (fields.length === 0) return { success: false, message: 'No fields to update' };
      values.push(id);
      await this.pool.query(`UPDATE mapel SET ${fields.join(', ')} WHERE id_mapel = ?`, values);
      return { success: true, message: 'Updated' };
    } catch (e) {
      return { success: false, message: 'Failed to update mapel', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async remove(id: number): Promise<ApiResponse<{}>> {
    try {
      const [res] = await this.pool.query('DELETE FROM mapel WHERE id_mapel = ?', [id]);
      if ((res as any).affectedRows === 0) return { success: false, message: 'Mapel not found' };
      return { success: true, message: 'Deleted' };
    } catch (e) {
      return { success: false, message: 'Failed to delete mapel', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }
}

export const mapelService = new MapelService();

