
const subMapelService = require('../services/subMapelService');

class subMapelController {
    // GET /api/users
    async getAllSubMapel(req, res) {
        try {
            const result = await subMapelService.serviceall();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get users',
                error: error.message
            });
        }
    }
    async getSubMapelById(req, res) {
        try {
            const { id } = req.params;
            const result = await subMapelService.getSubMapelById(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get sub mapel',
                error: error.message
            });
        }
    }

    async createSubMapel(req, res) {
        try {
            const { id_mapel, sub_mapel } = req.body;
            const result = await subMapelService.createSubMapel(id_mapel, sub_mapel);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to create sub mapel',
                error: error.message
            });
        }
    }
    async updateSubMapel(req, res) {
        try {
            const { id } = req.params;
            const { id_mapel, sub_mapel } = req.body;
            const result = await subMapelService.updateSubMapel(id, id_mapel, sub_mapel);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update sub mapel',
                error: error.message
            });
        }
    }
    async deleteSubMapel(req, res) {
        try {
            const { id } = req.params;
            const result = await subMapelService.deleteSubMapel(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete sub mapel',
                error: error.message
            });
        }
    }
}

module.exports = new subMapelController();
