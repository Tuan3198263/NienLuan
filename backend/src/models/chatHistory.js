const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho các sản phẩm trong tin nhắn
const ProductInfoSchema = new Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  name: String,
  price: String,
  rawPrice: Number,
  brand: {
    name: String,
    logo: String,
    description: String
  },
  category: String,
  image: String,
  images: [String],
  description: String,
  ingredients: String,
  usage: String,
  slug: String
}, { _id: false });

// Định nghĩa schema cho mỗi tin nhắn
const MessageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  products: [ProductInfoSchema], // Thông tin sản phẩm kèm theo tin nhắn
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Định nghĩa schema cho lịch sử chat
const ChatHistorySchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  messages: [MessageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để cập nhật thời gian khi có thay đổi
ChatHistorySchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.updatedAt = Date.now();
  }
  next();
});

// Index để tìm kiếm nhanh hơn
ChatHistorySchema.index({ userId: 1, sessionId: 1 }, { unique: true });

const ChatHistory = mongoose.model('ChatHistory', ChatHistorySchema);

module.exports = ChatHistory;
