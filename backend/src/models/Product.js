const mongoose = require('mongoose');
const unidecode = require("unidecode");
const slugify = require("slugify");

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
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến collection Brands
    ref: 'Brand', // Sử dụng 'Brand' thay vì 'String'
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
  if (this.isModified('name')) {
    // Sử dụng unidecode để loại bỏ dấu
    const nameWithoutAccents = unidecode(this.name);

    // Tạo slug từ tên đã loại bỏ dấu
    this.slug = slugify(nameWithoutAccents, {
      lower: true,  // Chuyển sang chữ thường
      strict: true, // Loại bỏ các ký tự đặc biệt như dấu chấm, dấu phẩy...
    });
  }

  next();
});

// Middleware để cập nhật lại `updatedAt` khi có sự thay đổi
ProductSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now(); // Cập nhật lại thời gian khi sản phẩm thay đổi
  }

  next();
});


// Middleware để tự động cập nhật slug khi sử dụng findOneAndUpdate
ProductSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(unidecode(update.name), { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
