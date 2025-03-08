const Review = require('../models/review');
const Product = require('../models/product');
const Order = require('../models/order'); // Import model Order

exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.userId; // Lấy userId từ token

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Đếm số lần người dùng đã mua sản phẩm này
    const orders = await Order.find({
      userId,
      'items.productId': productId,
      status: 'delivered' // Chỉ tính đơn đã giao thành công
    });

    const purchaseCount = orders.reduce((total, order) => {
      const item = order.items.find(i => i.productId.toString() === productId);
      return total + (item ? item.quantity : 0);
    }, 0);

    if (purchaseCount === 0) {
      return res.status(403).json({ message: "Bạn cần mua sản phẩm trước khi đánh giá" });
    }

    // Đếm số lần người dùng đã đánh giá sản phẩm
    const userReviews = await Review.countDocuments({ productId, userId });

    // So sánh số lượng đánh giá với số lần đã mua
    if (userReviews >= purchaseCount) {
      return res.status(400).json({ message: "Bạn đã đánh giá đủ số lần tương ứng với số lần mua" });
    }

    // Tạo review mới
    const review = new Review({
      productId,
      userId,
      rating,
      comment,
    });

    await review.save();

    res.status(201).json({ success: true,   message: "Đánh giá thành công", productName: product.name, review });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

//kiểm tra có thể đánh giá sản phẩm không
exports.checkReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params; // Lấy productId từ request params
    const userId = req.user.userId; // Lấy userId từ token

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Đếm số lần người dùng đã mua sản phẩm này
    const orders = await Order.find({
      userId,
      'items.productId': productId,
      status: 'delivered' // Chỉ tính đơn đã giao thành công
    });

    const purchaseCount = orders.reduce((total, order) => {
      const item = order.items.find(i => i.productId.toString() === productId);
      return total + (item ? item.quantity : 0);
    }, 0);

    if (purchaseCount === 0) {
      return res.status(200).json({ message: "Bạn chưa mua sản phẩm này nên không thể đánh giá", canReview: false });
    }

    // Đếm số lượt đánh giá của người dùng cho sản phẩm này
   const userReviews = await Review.countDocuments({ productId, userId, status: 'active' });

    // Kiểm tra số lượng đánh giá so với số lần đã mua
    if (userReviews >= purchaseCount) {
      return res.status(200).json({ message: "Bạn đã đánh giá đủ số lần tương ứng với số lần mua", canReview: false });
    }

    // Nếu đủ điều kiện để đánh giá
    res.status(200).json({
      message: "Bạn có thể đánh giá sản phẩm này",
      canReview: true,
      remainingReviews: purchaseCount - userReviews
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// lấy đánh giá của 1 sản phẩm
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId).populate({
      path: 'reviews',
      options: { sort: { createdAt: -1 } }, // Sắp xếp theo ngày đánh giá mới nhất
      populate: { path: 'userId', select: 'fullName avatar' }, // Lấy thông tin người đánh giá
    });

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    res.status(200).json({
      message: "Lấy đánh giá thành công",
      productName: product.name, // Thêm tên sản phẩm vào response
      reviews: product.reviews,
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


// lấy số sao, số lượng đánh giá , status = active
exports.getAverageRating = async (req, res) => {
  try {
    const { productId } = req.params;

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    const reviews = await Review.find({ productId });

    if (reviews.length === 0) {
      return res.status(200).json({ 
        message: "Chưa có đánh giá nào cho sản phẩm này", 
        averageRating: 0, 
        reviewCount: 0,
        ratingBreakdown: {
          "5": 0,
          "4": 0,
          "3": 0,
          "2": 0,
          "1": 0
        }
      });
    }

    // Tính số sao trung bình
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Thống kê số lượng đánh giá theo từng mức sao (1-5 ⭐)
    const ratingBreakdown = {
      "5": 0,
      "4": 0,
      "3": 0,
      "2": 0,
      "1": 0
    };

    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingBreakdown[review.rating]++;
      }
    });

    res.status(200).json({ 
      message: "Lấy số sao trung bình thành công", 
      averageRating: averageRating.toFixed(1), // Giữ 1 chữ số thập phân
      reviewCount: reviews.length,
      ratingBreakdown
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


// ẩn đánh giá
exports.hideReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    // Tìm review
    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).json({ message: "Đánh giá không tồn tại" });
    }

    // Cập nhật trạng thái thay vì xóa
    review.status = 'hidden';
    await review.save();

    res.status(200).json({ message: "Ẩn đánh giá thành công" });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

//hiện đánh giá 
// Hiện đánh giá (bỏ ẩn)
exports.unhideReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    // Tìm review bị ẩn của người dùng
    const review = await Review.findOne({ _id: reviewId, userId, status: 'hidden' });
    if (!review) {
      return res.status(404).json({ message: "Đánh giá không tồn tại hoặc không bị ẩn" });
    }

    // Cập nhật trạng thái thành 'active'
    review.status = 'active';
    await review.save();

    res.status(200).json({ message: "Hiện đánh giá thành công" });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};



