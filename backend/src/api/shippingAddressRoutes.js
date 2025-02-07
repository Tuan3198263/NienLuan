// api/shippingAddressRoutes.js
const express = require('express');
const router = express.Router();
const  ShippingAddress  = require('../controller/shippingAddressController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware kiểm tra token

// Dùng middleware authenticateToken để bảo vệ route
router.put('/update', authMiddleware, ShippingAddress.updateShippingAddress);

// API lấy thông tin địa chỉ người dùng
router.get('/', authMiddleware, ShippingAddress.getShippingAddress);

module.exports = router;
