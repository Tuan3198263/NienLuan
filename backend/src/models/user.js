const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phone: {
    type: String,
    required: false,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
    default: "",
  },
   avatar: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/6596/6596121.png', // URL của ảnh đại diện mặc định
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },
  ban: {
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
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);