const express = require('express');
const reviewController = require('../controller/reviewController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware xác thực người dùng

const router = express.Router();

// Route thêm đánh giá (cần đăng nhập)
router.post('/add', authMiddleware, reviewController.addReview);

// kiểm tra quyền đánh giá
router.get('/eligibility/:productId', authMiddleware, reviewController.checkReviewEligibility);

// lấy danh sách tất cả đánh giá cùng thông tin người đánh giá
router.get('/:productId', reviewController.getReviewsByProduct);

// Thêm route tính trung bình đánh giá sản phẩm
router.get('/average/:productId', reviewController.getAverageRating);

// Route ẩn đánh giá (chỉ admin mới có quyền)
router.put('/hide/:reviewId', authMiddleware, reviewController.hideReview);

// Route hiện lại đánh giá (bỏ ẩn)
router.put('/unhide/:reviewId', authMiddleware, reviewController.unhideReview);



module.exports = router;
