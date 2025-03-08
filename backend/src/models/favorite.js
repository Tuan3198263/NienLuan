const mongoose = require('mongoose');

// Schema cho sản phẩm yêu thích
const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến User
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến Product
    ref: 'Product',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Tạo model Favorites
module.exports = mongoose.model('Favorite', favoriteSchema);
