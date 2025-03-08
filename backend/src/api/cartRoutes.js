const express = require('express');
const cart  = require('../controller/cartController');
const  authMiddleware  = require('../middleware/authMiddleware') // Middleware xác thực

const router = express.Router();

router.get('/', authMiddleware, cart.getCart);                // Lấy giỏ hàng của user

router.post('/add', authMiddleware, cart.addToCart); // Thêm sản phẩm vào giỏ hàng

router.post('/remove', authMiddleware, cart.removeFromCart); // Giảm số lượng sản phẩm

router.post('/delete', authMiddleware, cart.removeItemFromCart); // Xóa sản phẩm khỏi giỏ hàng


module.exports = router;
