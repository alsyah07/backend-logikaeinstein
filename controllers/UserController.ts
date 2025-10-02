import { userService } from '../services/UserService';
import type { CreateUserRequest, LoginRequest } from '../services/UserService';

export class UserController {
  /**
   * GET /api/users - Get all users
   */
  async getAllUsers(req: Request): Promise<Response> {
    const result = await userService.getAllUsers();
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  /**
   * GET /api/users/:id - Get user by ID
   */
  async getUserById(req: Request, id: string): Promise<Response> {
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid user ID'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await userService.getUserById(userId);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  /**
   * POST /api/users - Create new user
   */
  async createUser(req: Request): Promise<Response> {
    try {
      const body = await req.json() as CreateUserRequest;
      const result = await userService.createUser(body);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 201 : 400,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON body',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  /**
   * PUT /api/users/:id - Update user by ID
   */
  async updateUser(req: Request, id: string): Promise<Response> {
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid user ID'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const body = await req.json() as Partial<CreateUserRequest>;
      const result = await userService.updateUser(userId, body);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON body',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  /**
   * DELETE /api/users/:id - Delete user by ID
   */
  async deleteUser(req: Request, id: string): Promise<Response> {
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid user ID'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await userService.deleteUser(userId);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  /**
   * POST /api/users/login - Login user with email and password
   */
  async login(req: Request): Promise<Response> {
    try {
      const body = await req.json() as LoginRequest;
      const result = await userService.login(body);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 401,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON body',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}

// Export singleton instance
export const userController = new UserController();