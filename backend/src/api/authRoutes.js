const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware kiểm tra token

// Đăng ký
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Cập nhật thông tin (cần đăng nhập)
router.put('/update', authMiddleware, authController.updateUser);

// Cập nhật thông tin người dùng (admin)
router.put('/admin/update-user/:userId', authController.updateUserByAdmin);

// Xóa người dùng (admin)
router.delete('/admin/delete-user/:userId', authController.deleteUserByAdmin);

//lấy tất cả người dùng
router.get('/get-users', authController.getAllUsers);

// API lấy thông tin người dùng (yêu cầu token)
router.get('/user', authMiddleware, authController.getUserById);


module.exports = router;
