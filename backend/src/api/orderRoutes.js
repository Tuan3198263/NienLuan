const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware
const orderController = require('../controller/orderController'); // Import controller createOrder

// Route tạo đơn hàng (với middleware xác thực)
router.post('/create-order', authMiddleware, orderController.createOrder);

// lấy danh sách đơn theo trạngthai
router.get('/', authMiddleware,  orderController.getOrdersByStatus);

// lấy chi tiết đơn theo id
router.get('/details/:orderCode', authMiddleware, orderController.getOrderByCode);

//đổi trạng thai-webhook
router.post('/webhook', orderController.updateOrderStatusFromWebhook);


// Thêm route mới để admin lấy tất cả đơn hàng
router.get('/admin/orders', orderController.getAllOrders);


module.exports = router;

