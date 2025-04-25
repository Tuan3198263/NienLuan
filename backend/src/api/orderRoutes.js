const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware
const orderController = require('../controller/orderController'); // Import controller createOrder

// Route tạo đơn hàng (với middleware xác thực) (user)
router.post('/create-order', authMiddleware, orderController.createOrder);

// lấy danh sách đơn theo trạngthai (user)
router.get('/', authMiddleware,  orderController.getOrdersByStatus);

// lấy chi tiết đơn theo id (user)
router.get('/details/:orderCode', authMiddleware, orderController.getOrderByCode);

//đổi trạng thai-webhook 
router.post('/webhook', orderController.updateOrderStatusFromWebhook);


// Thêm route mới để admin lấy tất cả đơn hàng (admin)
router.get('/admin/orders', orderController.getAllOrders);

// Thêm route hủy đơn hàng (user)
router.post('/cancel/:orderCode', authMiddleware, orderController.cancelOrder);

// Thêm route để admin hủy đơn hàng (không cần xác thực user) (admin)
router.post('/admin/cancel/:orderCode', orderController.cancelOrderByAdmin);

module.exports = router;

