const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'hidden'], // Chỉ nhận 2 trạng thái
    default: 'active', // Mặc định là hiển thị
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

ReviewSchema.post('save', async function () {
  const Review = mongoose.model('Review');
  const Product = mongoose.model('Product');

  try {
    // Lấy tất cả đánh giá hiển thị của sản phẩm (chỉ tính review active)
    const reviews = await Review.find({ productId: this.productId });

    // Tính điểm trung bình mới
    const averageRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // Đảm bảo review này luôn có trong mảng reviews của product
    await Product.findByIdAndUpdate(this.productId, {
      $addToSet: { reviews: this._id }, // Thêm nếu chưa có
      averageRating
    });

  } catch (error) {
    console.error("Error in post-save middleware:", error);
  }
});





module.exports = mongoose.model('Review', ReviewSchema);
