const detailVideoMapelService = require('../services/detailVideoMapelService.js');
const redeemService = require('../services/redeemService.js');
class redeemController {

    async getRedeemUsersById(req, res) {
        try {
            const { code_redeem, id_user } = req.params;
            const result = await redeemService.getRedeemUsersById(code_redeem, id_user);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get detail video mapel by id',
                error: error.message
            });
        }
    }
    async createRedeemUsers(req, res) {
        try {
            const redeemUsersData = req.body;
            const result = await redeemService.createRedeemUsers(redeemUsersData);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to create redeem users',
                error: error.message
            });
        }
    }

    async getAllRedeemUsers(req, res) {
        try {
            const { id, no_hp } = req.params;
            const result = await redeemService.getAllRedeemUsers(id, no_hp);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get all redeem users',
                error: error.message
            });
        }
    }
}

module.exports = new redeemController();