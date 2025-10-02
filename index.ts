import { router } from './router';
import { userController } from './controllers/UserController';
import { dbPool } from './services/Db';
import { roleController } from './controllers/RoleController';
import { mapelController } from './controllers/MapelController';
import { subMapelController } from './controllers/SubMapelController';
import { detailVideoMapelController } from './controllers/DetailVideoMapelController';
import { transactionController } from './controllers/TransactionController';
import { codeRedeemController } from './controllers/CodeRedeemController';

// Initialize database connection only (no schema application)
const initDatabase = async () => {
  try {
    await dbPool.query('SELECT 1');
    console.log('📊 Database connection OK');
  } catch (e) {
    console.error('Failed to connect to database', e);
  }
};

// Setup routes
const setupRoutes = () => {
  // Health check endpoint
  router.get('/health', async (req) => {
    return new Response(JSON.stringify({ status: "OK", message: "Server is running" }), {
      headers: { "Content-Type": "application/json" },
    });
  });

  // API info endpoint
  router.get('/api', async (req) => {
    return new Response(JSON.stringify({ 
      name: "Backend Logika Einstein API",
      version: "1.0.0",
      description: "API server built with Bun.js",
      database: "Connected to localhost",
      endpoints: {
        "GET /health": "Health check",
        "GET /api": "API information",
        "GET /api/users": "Get all users",
        "GET /api/users/:id": "Get user by ID",
        "POST /api/users": "Create new user",
        "PUT /api/users/:id": "Update user by ID",
        "DELETE /api/users/:id": "Delete user by ID"
      }
    }), {
      headers: { "Content-Type": "application/json" },
    });
  });

  // User routes
  router.get('/api/users', userController.getAllUsers.bind(userController));
  router.get('/api/users/:id', (req, params) => userController.getUserById(req, params?.id));
  router.post('/api/users', userController.createUser.bind(userController));
  router.put('/api/users/:id', (req, params) => userController.updateUser(req, params?.id));
  router.delete('/api/users/:id', (req, params) => userController.deleteUser(req, params?.id));
  router.post('/api/users/login', userController.login.bind(userController));

  // Role routes
  router.get('/api/roles', roleController.getAll.bind(roleController));
  router.get('/api/roles/:id', (req, params) => roleController.getById(req, params?.id));
  router.post('/api/roles', roleController.create.bind(roleController));
  router.put('/api/roles/:id', (req, params) => roleController.update(req, params?.id));
  router.delete('/api/roles/:id', (req, params) => roleController.remove(req, params?.id));

  // Mapel routes (use id_mapel as :id)
  router.get('/api/mapel', mapelController.getAll.bind(mapelController));
  router.get('/api/mapel/:id', (req, params) => mapelController.getById(req, params?.id));
  router.post('/api/mapel', mapelController.create.bind(mapelController));
  router.put('/api/mapel/:id', (req, params) => mapelController.update(req, params?.id));
  router.delete('/api/mapel/:id', (req, params) => mapelController.remove(req, params?.id));

  // sub_mapel routes (use id_sub_mapel as :id)
  router.get('/api/sub-mapel', subMapelController.getAll.bind(subMapelController));
  router.get('/api/sub-mapel/:id', (req, params) => subMapelController.getById(req, params?.id));
  router.post('/api/sub-mapel', subMapelController.create.bind(subMapelController));
  router.put('/api/sub-mapel/:id', (req, params) => subMapelController.update(req, params?.id));
  router.delete('/api/sub-mapel/:id', (req, params) => subMapelController.remove(req, params?.id));

  // detail_video_mapel routes (use id_detail_video_mapel as :id)
  router.get('/api/detail-video-mapel', detailVideoMapelController.getAll.bind(detailVideoMapelController));
  router.get('/api/detail-video-mapel/:id', (req, params) => detailVideoMapelController.getById(req, params?.id));
  router.post('/api/detail-video-mapel', detailVideoMapelController.create.bind(detailVideoMapelController));
  router.put('/api/detail-video-mapel/:id', (req, params) => detailVideoMapelController.update(req, params?.id));
  router.delete('/api/detail-video-mapel/:id', (req, params) => detailVideoMapelController.remove(req, params?.id));

  // transaction routes (use id_transaction as :id)
  router.get('/api/transactions', transactionController.getAll.bind(transactionController));
  router.get('/api/transactions/:id', (req, params) => transactionController.getById(req, params?.id));
  router.post('/api/transactions', transactionController.create.bind(transactionController));
  router.put('/api/transactions/:id', (req, params) => transactionController.update(req, params?.id));
  router.delete('/api/transactions/:id', (req, params) => transactionController.remove(req, params?.id));

  // code_redeem routes (use id_code_redeem as :id)
  router.get('/api/code-redeem', codeRedeemController.getAll.bind(codeRedeemController));
  router.get('/api/code-redeem/:id', (req, params) => codeRedeemController.getById(req, params?.id));
  router.post('/api/code-redeem', codeRedeemController.create.bind(codeRedeemController));
  router.put('/api/code-redeem/:id', (req, params) => codeRedeemController.update(req, params?.id));
  router.delete('/api/code-redeem/:id', (req, params) => codeRedeemController.remove(req, params?.id));
};

// Initialize database and routes on startup
await initDatabase();
setupRoutes();

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Try to handle with router first
    const response = await router.handle(req);
    if (response) {
      // Add CORS headers to all responses
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }
    
    // Default 404 response
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { 
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  },
});

console.log(`🚀 Server running at http://localhost:${server.port}`);
console.log(`📋 Available endpoints:`);
console.log(`   GET /health - Health check`);
console.log(`   GET /api - API information`);
console.log(`   GET /api/users - Get all users`);
console.log(`   GET /api/users/:id - Get user by ID`);
console.log(`   POST /api/users - Create new user`);
console.log(`   PUT /api/users/:id - Update user`);
console.log(`   DELETE /api/users/:id - Delete user`);
console.log(`\n🔥 Backend Logika Einstein API with MVC Architecture is ready!`);