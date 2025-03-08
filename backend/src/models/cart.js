const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  priceAtTime: {  // Lưu giá sản phẩm tại thời điểm thêm vào giỏ
    type: Number,
    required: true,
    min: 0,
  }
}, { _id: false });  // Không tạo ObjectId cho mỗi item

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,  // Mỗi user chỉ có một giỏ hàng
  },
  items: [CartItemSchema],  // Danh sách sản phẩm trong giỏ
  totalPrice: {
    type: Number,
    default: 0,
    min: 0,
  }
}, { timestamps: true });

// Middleware cập nhật totalPrice trước khi lưu
CartSchema.pre('save', function (next) {
  this.totalPrice = this.items.reduce((total, item) => total + (item.quantity * item.priceAtTime), 0);
  next();
});

module.exports = mongoose.model('Cart', CartSchema);
