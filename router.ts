export interface Route {
  method: string;
  path: string;
  handler: (req: Request, params?: any) => Promise<Response>;
}

export class Router {
  private routes: Route[] = [];

  /**
   * Add a GET route
   */
  get(path: string, handler: (req: Request, params?: any) => Promise<Response>) {
    this.routes.push({ method: 'GET', path, handler });
  }

  /**
   * Add a POST route
   */
  post(path: string, handler: (req: Request, params?: any) => Promise<Response>) {
    this.routes.push({ method: 'POST', path, handler });
  }

  /**
   * Add a PUT route
   */
  put(path: string, handler: (req: Request, params?: any) => Promise<Response>) {
    this.routes.push({ method: 'PUT', path, handler });
  }

  /**
   * Add a DELETE route
   */
  delete(path: string, handler: (req: Request, params?: any) => Promise<Response>) {
    this.routes.push({ method: 'DELETE', path, handler });
  }

  /**
   * Handle incoming request
   */
  async handle(req: Request): Promise<Response | null> {
    const url = new URL(req.url);
    const method = req.method;
    const pathname = url.pathname;

    for (const route of this.routes) {
      if (route.method !== method) continue;

      // Check for exact match
      if (route.path === pathname) {
        return await route.handler(req);
      }

      // Check for parameterized routes (e.g., /api/users/:id)
      const routeParts = route.path.split('/');
      const pathParts = pathname.split('/');

      if (routeParts.length !== pathParts.length) continue;

      let isMatch = true;
      const params: { [key: string]: string } = {};

      for (let i = 0; i < routeParts.length; i++) {
        const routePart = routeParts[i];
        const pathPart = pathParts[i];

        if (!routePart || !pathPart) {
          isMatch = false;
          break;
        }

        if (routePart.startsWith(':')) {
          // This is a parameter
          const paramName = routePart.slice(1);
          params[paramName] = pathPart;
        } else if (routePart !== pathPart) {
          // Not a match
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        return await route.handler(req, params);
      }
    }

    return null; // No route found
  }

  /**
   * Get all registered routes
   */
  getRoutes(): Route[] {
    return this.routes;
  }
}

// Export singleton instance
export const router = new Router();