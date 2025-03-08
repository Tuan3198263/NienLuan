const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderCode: {
    type: String,
    required: false,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shippingInfo: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    cityName: { type: String, required: true },
    districtName: { type: String, required: true },
    wardName: { type: String, required: true },
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 },
      priceAtTime: { type: Number, required: true, min: 0 },
    }
  ],
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingFeeDetails: {
    mainFee: { type: Number, required: true, default: 0 }, // Phí vận chuyển gốc
    discount: { type: Number, required: true, default: 0 }, // Giảm phí (nếu có)
    finalFee: { type: Number, required: true, default: 0 }, // Phí vận chuyển sau khi giảm
  },
 status: {
    type: String,
    enum: [
        'pending',   // Đơn hàng mới, chưa xử lý (chờ xác nhận)
        'processed', // Đơn hàng đã được xử lý (nhân viên đang lấy hàng hoặc đã lấy hàng)(đã xác nhận)
        'shipped',   // Đơn hàng đang được vận chuyển (đã rời khỏi kho, đang giao)(đang giao)
        'delivered', // Đơn hàng đã giao thành công đến người nhận(đã nhận)
        'canceled',  // Đơn hàng bị hủy (do khách hàng hoặc lỗi giao hàng)(đã hủy)
        'returned'   // Đơn hàng đã được trả lại cho người gửi(đã trả)
    ],
    default: 'pending' // Mặc định đơn hàng mới sẽ có trạng thái "pending"
},
  orderDate: { type: Date, default: Date.now },
  estimatedDeliveryDate: { type: Date, required: false },
  updateDate: { type: Date, required: false },
}, { timestamps: true });

// Middleware tính tổng giá trị đơn hàng trước khi lưu
orderSchema.pre('save', function (next) {
  // Tính tổng giá sản phẩm
  this.totalPrice = this.items.reduce((total, item) => total + (item.quantity * item.priceAtTime), 0);

  // Cập nhật phí vận chuyển cuối cùng nếu chưa có
  if (!this.shippingFeeDetails.finalFee) {
    this.shippingFeeDetails.finalFee = Math.max(
      this.shippingFeeDetails.mainFee - this.shippingFeeDetails.discount, 
      0
    );
  }

  // Thêm phí vận chuyển vào tổng giá trị đơn hàng
  this.totalPrice += this.shippingFeeDetails.finalFee;

// Tạo mã đơn hàng nếu chưa có
if (!this.orderCode) {
  const randomString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'  // Danh sách các ký tự chữ cái
    .charAt(Math.floor(Math.random() * 26))           // Lấy một ký tự ngẫu nhiên từ A-Z
    + Math.random().toString(36).substring(2, 9).toUpperCase(); // Kết hợp với phần còn lại là số + chữ ngẫu nhiên
  this.orderCode = randomString.slice(0, 8);         // Lấy 8 ký tự
}


  // Cập nhật thời gian sửa đổi đơn hàng
  this.updateDate = new Date();

  next();
});

// Xuất model
module.exports = mongoose.model('Order', orderSchema);
