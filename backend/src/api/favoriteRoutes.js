const express = require('express');
const router = express.Router();
const favoriteController = require('../controller/favoriteController');
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware

// API để Thêm hoặc Xóa sản phẩm yêu thích (Cần phải xác thực người dùng)
router.post('/toggle', authMiddleware, favoriteController.toggleFavorite);

// API lấy danh sách yêu thích của người dùng (Cần phải xác thực người dùng)
router.get('/list', authMiddleware, favoriteController.getFavorites);

// Kiểm tra trạng thái yêu thích của một sản phẩm
router.get('/check/:productId', authMiddleware, favoriteController.checkFavoriteStatus);

router.get("/count/:productId", favoriteController.getFavoriteCountById);



module.exports = router;
