const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến collection Category
    ref: 'Category',
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  images: [{
    type: String, // Lưu URL của ảnh
    required: true,
  }],
  description: {
    type: String,
    required: true,
  },
  ingredients: {
    type: String,
    required: true,
  },
  usage: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến collection Review
    ref: 'Review',
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  active: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  slug: {
    type: String,
    unique: true,
  },
});

// Middleware để tạo slug tự động
ProductSchema.pre('save', function (next) {
  this.slug = this.name
    .toLowerCase()
    .split(' ')
    .join('-')
    .replace(/[^\w-]/g, '');
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
