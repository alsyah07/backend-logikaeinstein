
const express = require('express');
const router = express.Router();

// Import user controller
const userController = require('../controller/userController.js');
const mapelController = require('../controller/mapelController.js');
const subMapelController = require('../controller/subMapelController.js');
const detailVideoMapelController = require('../controller/detailVideoMapelController.js');
const redeemController = require('../controller/redeemController.js');
const subMapelDetailController = require('../controller/subMapelDetailController.js');



// ============================================
// USER ROUTES
// ============================================
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.put('/users_password/:id', userController.handleChangePassword);
router.delete('/users/:id', userController.deleteUser);
router.post('/users/login', userController.loginUser);
// ============================================
// MAPEL ROUTES
// ============================================
router.get('/mapel', mapelController.getAllMapel);
router.get('/mapel/:id', mapelController.getMapelById);
router.post('/mapel', mapelController.createMapel);
router.put('/mapel/:id', mapelController.updateMapel);
router.delete('/mapel/:id', mapelController.deleteMapel);
// ============================================
// MAPEL SUB MAPEL
// ============================================
router.get('/sub_mapel', subMapelController.getAllSubMapel);
router.get('/sub_mapel/:id', subMapelController.getSubMapelById);
router.post('/sub_mapel', subMapelController.createSubMapel);
router.put('/sub_mapel/:id', subMapelController.updateSubMapel);
router.delete('/sub_mapel/:id', subMapelController.deleteSubMapel);

// ============================================
// MAPEL SUB MAPEL DETAIL
// ============================================
//router.get('/sub_mapel_detail', subMapelDetailController.getAllSubMapelDetail);
router.get('/sub_mapel_detail/:id', subMapelDetailController.getSubMapelDetailById);
// ============================================
// MAPEL DETAIL VIDEO MAPEL
// ============================================
router.get('/detail_video_mapel', detailVideoMapelController.getAllDetailVideoMapel);
router.get('/detail_video_mapel/:id', detailVideoMapelController.getDetailVideoMapelById);
router.get('/detail_video_mapel/sub_mapel/:id_sub_mapel_detail/:id_users?', detailVideoMapelController.getDetailVideoMapelByIdSubMapel);
router.get('/detail_video_pembahasan/:id_sub_mapel_detail/:id_users?', detailVideoMapelController.getDetailVideoMapelByIdSubMapelPembahasan);
router.post('/detail_video_mapel', detailVideoMapelController.createDetailVideoMapel);
// router.put('/detail_video_mapel/:id', detailVideoMapelController.updateDetailVideoMapel);
// router.delete('/detail_video_mapel/:id', detailVideoMapelController.deleteDetailVideoMapel);

router.get('/redeem_users/:code_redeem/:id_user?', redeemController.getRedeemUsersById);
router.get('/code_redeem/:id/:no_hp', redeemController.getAllRedeemUsers);
router.post('/redeem_users', redeemController.createRedeemUsers);
router.get('/all_code_redeem', redeemController.getAllCodeRedeem);



module.exports = router;
