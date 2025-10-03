
const express = require('express');
const router = express.Router();

// Import user controller
const userController = require('../controller/userController.js');

// ============================================
// USER ROUTES
// ============================================
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

router.post('/users/login', userController.loginUser);

module.exports = router;
