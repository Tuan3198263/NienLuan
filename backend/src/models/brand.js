const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho thương hiệu (Brand)
const brandSchema = new Schema({
  name: {
    type: String,
    required: true, // Trường bắt buộc
    trim: true, // Loại bỏ khoảng trắng thừa
  },
  logo: {
    type: String,
    required: true, // Trường bắt buộc, có thể là URL hoặc đường dẫn đến hình ảnh
  },
  description: {
    type: String,
    required: true, // Trường bắt buộc
    trim: true, // Loại bỏ khoảng trắng thừa
  },
}, { timestamps: true }); // Thêm trường thời gian tạo và cập nhật

// Tạo model từ schema
const Brand = mongoose.model('Brand', brandSchema);

// Export model
module.exports = Brand;
