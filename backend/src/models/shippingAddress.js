const mongoose = require('mongoose');

// Định nghĩa schema cho địa chỉ nhận hàng
const shippingAddressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Tham chiếu đến model User để liên kết người dùng với địa chỉ
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
  },
  cityName: {
    type: String,
    required: true,  // Tên thành phố, sẽ lưu tên thay vì mã code
  },
  district: {
    type: String,
    required: true,
  },
  districtName: {
    type: String,
    required: true,  // Tên quận, sẽ lưu tên thay vì mã code
  },
  ward: {
    type: String,
    required: true,
  },
  wardName: {
    type: String,
    required: true,  // Tên phường, sẽ lưu tên thay vì mã code
  },
  isDefault: {
    type: Boolean,
    default: false,  // Cho phép chỉ định địa chỉ mặc định
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Tạo model từ schema trên
module.exports = mongoose.model('ShippingAddress', shippingAddressSchema);
