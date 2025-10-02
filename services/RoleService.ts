import type { Pool } from 'mysql2/promise';
import { dbPool } from './Db';

export interface Role {
  id_role: number;
  role: string;
  status?: string;
  created_at?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface CreateRoleRequest {
  role: string;
  status?: string;
}

export class RoleService {
  private pool: Pool;

  constructor() {
    this.pool = dbPool;
  }

  async getAll(): Promise<ApiResponse<Role[]>> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM role ORDER BY id_role DESC');
      return { success: true, data: rows as Role[], message: 'OK' };
    } catch (e) {
      return { success: false, message: 'Failed to fetch roles', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async getById(id: number): Promise<ApiResponse<Role>> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM role WHERE id_role = ?', [id]);
      const list = rows as Role[];
      if (list.length === 0) return { success: false, message: 'Role not found' };
      return { success: true, data: list[0], message: 'OK' };
    } catch (e) {
      return { success: false, message: 'Failed to fetch role', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async create(payload: CreateRoleRequest): Promise<ApiResponse<{ insertId: number }>> {
    try {
      if (!payload.role || payload.role.trim() === '') {
        return { success: false, message: 'role is required' };
      }
      const [result] = await this.pool.query('INSERT INTO role (role, status) VALUES (?, COALESCE(?, "active"))', [payload.role, payload.status]);
      const insertId = (result as any).insertId as number;
      return { success: true, data: { insertId }, message: 'Created' };
    } catch (e) {
      return { success: false, message: 'Failed to create role', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async update(id: number, payload: Partial<CreateRoleRequest>): Promise<ApiResponse<{}>> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      if (payload.role !== undefined) { fields.push('role = ?'); values.push(payload.role); }
      if (payload.status !== undefined) { fields.push('status = ?'); values.push(payload.status); }
      if (fields.length === 0) return { success: false, message: 'No fields to update' };
      values.push(id);
      await this.pool.query(`UPDATE role SET ${fields.join(', ')} WHERE id_role = ?`, values);
      return { success: true, message: 'Updated' };
    } catch (e) {
      return { success: false, message: 'Failed to update role', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async remove(id: number): Promise<ApiResponse<{}>> {
    try {
      const [rows] = await this.pool.query('DELETE FROM role WHERE id_role = ?', [id]);
      const affectedRows = (rows as any).affectedRows as number;
      if (affectedRows === 0) return { success: false, message: 'Role not found' };
      return { success: true, message: 'Deleted' };
    } catch (e) {
      return { success: false, message: 'Failed to delete role', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }
}

export const roleService = new RoleService();

