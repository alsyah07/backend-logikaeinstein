
const userService = require('../services/userService');

class UserController {
  // GET /api/users
  async getAllUsers(req, res) {
    try {
      const result = await userService.getAllUsers();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: error.message
      });
    }
  }

  // GET /api/users/:id
  async getUserById(req, res) {
    try {
      const result = await userService.getUserById(req.params.id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
        error: error.message
      });
    }
  }

  // POST /api/users
  async createUser(req, res) {
    try {
      const result = await userService.createUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      });
    }
  }

  // PUT /api/users/:id
  async updateUser(req, res) {
    try {
      const result = await userService.updateUser(req.params.id, req.body);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message
      });
    }
  }

  // DELETE /api/users/:id
  async deleteUser(req, res) {
    try {
      const result = await userService.deleteUser(req.params.id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
  }
  // POST /api/v1/login
async loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUser(email, password);
    
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
}
}

module.exports = new UserController();
