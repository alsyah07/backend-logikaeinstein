import { codeRedeemService } from '../services/CodeRedeemService';

export class CodeRedeemController {
  async getAll(req: Request): Promise<Response> {
    const result = await codeRedeemService.getAll();
    return new Response(JSON.stringify(result), { status: result.success ? 200 : 500, headers: { 'Content-Type': 'application/json' } });
  }

  async getById(req: Request, id?: string): Promise<Response> {
    const crId = parseInt(id || '');
    if (isNaN(crId)) return new Response(JSON.stringify({ success: false, message: 'Invalid id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    const result = await codeRedeemService.getById(crId);
    return new Response(JSON.stringify(result), { status: result.success ? 200 : 404, headers: { 'Content-Type': 'application/json' } });
  }

  async create(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const result = await codeRedeemService.create(body);
      return new Response(JSON.stringify(result), { status: result.success ? 201 : 400, headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid JSON', error: e instanceof Error ? e.message : 'Unknown error' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }

  async update(req: Request, id?: string): Promise<Response> {
    const crId = parseInt(id || '');
    if (isNaN(crId)) return new Response(JSON.stringify({ success: false, message: 'Invalid id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    try {
      const body = await req.json();
      const result = await codeRedeemService.update(crId, body);
      return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid JSON', error: e instanceof Error ? e.message : 'Unknown error' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }

  async remove(req: Request, id?: string): Promise<Response> {
    const crId = parseInt(id || '');
    if (isNaN(crId)) return new Response(JSON.stringify({ success: false, message: 'Invalid id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    const result = await codeRedeemService.remove(crId);
    return new Response(JSON.stringify(result), { status: result.success ? 200 : 404, headers: { 'Content-Type': 'application/json' } });
  }
}

export const codeRedeemController = new CodeRedeemController();

