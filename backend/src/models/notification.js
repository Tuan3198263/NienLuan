const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true, // Nội dung thông báo (bắt buộc)
    },
    icon: {
      type: String,
      default: "fas fa-info-circle", // Icon mặc định nếu không có
    },
    time: {
      type: Date,
      default: Date.now, // Mặc định là thời gian hiện tại
    },
    read: {
      type: Boolean,
      default: false, // Mặc định là chưa đọc
    },
    type: {
      type: String,
      enum: [
        "order",     // 🛒 Thông báo liên quan đến đơn hàng (ví dụ: đơn hàng mới, hủy đơn)
        "customer",  // 👤 Thông báo liên quan đến khách hàng (ví dụ: khách hàng mới đăng ký)
        "inventory", // 📦 Thông báo liên quan đến kho hàng (ví dụ: sản phẩm sắp hết hàng)
        "report",    // 📊 Thông báo liên quan đến báo cáo (ví dụ: báo cáo doanh thu)
        "other"      // 📝 Thông báo khác không thuộc các loại trên
      ],
      required: true, // Bắt buộc phải có loại thông báo
    },
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

// Xuất model Notification để sử dụng trong các file khác
module.exports = mongoose.model('Notification', notificationSchema);
