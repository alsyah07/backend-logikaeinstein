import { detailVideoMapelService } from '../services/DetailVideoMapelService';

export class DetailVideoMapelController {
  async getAll(req: Request): Promise<Response> {
    const result = await detailVideoMapelService.getAll();
    return new Response(JSON.stringify(result), { status: result.success ? 200 : 500, headers: { 'Content-Type': 'application/json' } });
  }

  async getById(req: Request, id?: string): Promise<Response> {
    const dvId = parseInt(id || '');
    if (isNaN(dvId)) return new Response(JSON.stringify({ success: false, message: 'Invalid id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    const result = await detailVideoMapelService.getById(dvId);
    return new Response(JSON.stringify(result), { status: result.success ? 200 : 404, headers: { 'Content-Type': 'application/json' } });
  }

  async create(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const result = await detailVideoMapelService.create(body);
      return new Response(JSON.stringify(result), { status: result.success ? 201 : 400, headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid JSON', error: e instanceof Error ? e.message : 'Unknown error' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }

  async update(req: Request, id?: string): Promise<Response> {
    const dvId = parseInt(id || '');
    if (isNaN(dvId)) return new Response(JSON.stringify({ success: false, message: 'Invalid id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    try {
      const body = await req.json();
      const result = await detailVideoMapelService.update(dvId, body);
      return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid JSON', error: e instanceof Error ? e.message : 'Unknown error' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }

  async remove(req: Request, id?: string): Promise<Response> {
    const dvId = parseInt(id || '');
    if (isNaN(dvId)) return new Response(JSON.stringify({ success: false, message: 'Invalid id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    const result = await detailVideoMapelService.remove(dvId);
    return new Response(JSON.stringify(result), { status: result.success ? 200 : 404, headers: { 'Content-Type': 'application/json' } });
  }
}

export const detailVideoMapelController = new DetailVideoMapelController();

