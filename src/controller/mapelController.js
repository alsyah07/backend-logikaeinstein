
const mapelService = require('../services/mapelService');


class mapelController {
  // GET /api/users
  async getAllMapel(req, res) {
    try {
      const result = await mapelService.getall();
      console.log('resultresult',result)
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
  async getMapelById(req, res) {
    try {
      const result = await mapelService.getMapelById(req.params.id);
      
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
  async createMapel(req, res) {
    try {
      const result = await mapelService.createMapel(req.body);
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
  async updateMapel(req, res) {
    try {
      const result = await mapelService.updateMapel(req.params.id, req.body);
      
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
  async deleteMapel(req, res) {
    try {
      const result = await mapelService.deleteMapel(req.params.id);
      
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
}

module.exports = new mapelController();
