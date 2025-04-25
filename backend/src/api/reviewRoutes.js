const express = require('express');
const reviewController = require('../controller/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Các route cụ thể phải đặt trước các route có parameter
// Route thêm đánh giá mới (yêu cầu đăng nhập)
router.post('/add', authMiddleware, reviewController.addReview);

// Route lấy danh sách sản phẩm đã đánh giá của người dùng
router.get('/reviewed-products', authMiddleware, reviewController.getUserReviewedProducts);

// Route lấy danh sách sản phẩm chờ đánh giá của người dùng
router.get('/pending-reviews', authMiddleware, reviewController.getPendingReviewProducts);

// Route lấy số sao trung bình và thống kê đánh giá của sản phẩm
router.get('/average/:productId', reviewController.getAverageRating);

// Route kiểm tra quyền đánh giá sản phẩm của người dùng
router.get('/eligibility/:productId', authMiddleware, reviewController.checkReviewEligibility);

// Route ẩn đánh giá (chỉ người dùng sở hữu đánh giá)
router.put('/hide/:reviewId', authMiddleware, reviewController.hideReview);

// Route hiện lại đánh giá đã ẩn (chỉ người dùng sở hữu đánh giá)
router.put('/unhide/:reviewId', authMiddleware, reviewController.unhideReview);

// Route lấy tất cả đánh giá của một sản phẩm (đặt cuối cùng vì có parameter)
router.get('/:productId', reviewController.getReviewsByProduct);

module.exports = router;
