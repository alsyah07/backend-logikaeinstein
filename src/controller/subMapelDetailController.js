
const subMapelDetailService = require('../services/subMapelDetailService');



class subMapelDetailController {
    // GET /api/users
   
    async getSubMapelDetailById(req, res) {
        try {
            const { id } = req.params;
            const result = await subMapelDetailService.getSubMapelById(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get sub mapel',
                error: error.message
            });
        }
    }
}

module.exports = new subMapelDetailController();
