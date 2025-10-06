
const express = require('express');
const router = express.Router();

// Import user controller
const userController = require('../controller/userController.js');
const mapelController = require('../controller/mapelController.js');
const subMapelController = require('../controller/subMapelController.js');
const detailVideoMapelController = require('../controller/detailVideoMapelController.js');

// ============================================
// USER ROUTES
// ============================================
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
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
// MAPEL DETAIL VIDEO MAPEL
// ============================================
router.get('/detail_video_mapel', detailVideoMapelController.getAllDetailVideoMapel);
router.get('/detail_video_mapel/:id', detailVideoMapelController.getDetailVideoMapelById);
router.get('/detail_video_mapel/sub_mapel/:id_sub_mapel', detailVideoMapelController.getDetailVideoMapelByIdSubMapel);
router.post('/detail_video_mapel', detailVideoMapelController.createDetailVideoMapel);
// router.put('/detail_video_mapel/:id', detailVideoMapelController.updateDetailVideoMapel);
// router.delete('/detail_video_mapel/:id', detailVideoMapelController.deleteDetailVideoMapel);



module.exports = router;
