const detailVideoMapelService = require('../services/detailVideoMapelService.js');
class detailVideoMapelController {
    async getAllDetailVideoMapel(req, res) {
        try {
            const result = await detailVideoMapelService.getAllDetailVideoMapel();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get all detail video mapel',
                error: error.message
            });
        }
    }
    async getDetailVideoMapelById(req, res) {
        try {
            const { id } = req.params;
            const result = await detailVideoMapelService.getDetailVideoMapelById(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get detail video mapel by id',
                error: error.message
            });
        }
    }
    async createDetailVideoMapel(req, res) {
        try {
            const detailVideoMapelData = req.body;
            const result = await detailVideoMapelService.createDetailVideoMapel(detailVideoMapelData);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to create detail video mapel',
                error: error.message
            });
        }
    }

    async getDetailVideoMapelByIdSubMapel(req, res) {
        try {
            const { id_sub_mapel,id_users } = req.params;
            const result = await detailVideoMapelService.getDetailVideoMapelByIdSubMapel(id_sub_mapel,id_users);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get detail video mapel by sub mapel id',
                error: error.message
            });
        }
    }
}

module.exports = new detailVideoMapelController();