const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const authController = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware kiểm tra token

// Đăng ký
router.post('/register', authController.register);

// Đăng ký admin mới với mã xác thực
router.post('/register-admin', authController.registerAdmin);

// Đăng nhập
router.post('/login', authController.login);

// Cập nhật thông tin (cần đăng nhập)
router.put('/update', authMiddleware, authController.updateUser);

// Cập nhật thông tin người dùng (admin)
router.put('/admin/update-user/:userId', authController.updateUserByAdmin);

// Xóa người dùng (admin)
router.delete('/admin/delete-user/:userId', authController.deleteUserByAdmin);

//lấy tất cả người dùng(admin)
router.get('/get-users', authController.getAllUsers);

// API lấy thông tin người dùng (yêu cầu token)
router.get('/user', authMiddleware, authController.getUserById);

// API chỉnh sửa ảnh đại diện
router.put('/update-avatar', upload.single('avatar'), authMiddleware,authController.updateAvatar);

// Định nghĩa route với middleware xác thực token
router.get('/avatar', authMiddleware, authController.getAvatar);  // GET /avatar để lấy ảnh đại diện


module.exports = router;
