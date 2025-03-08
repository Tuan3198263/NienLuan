const express = require('express');
const router = express.Router();
const emailController = require('../controller/emailController');

router.post('/send-order-delivered', async (req, res) => {
    try {
        const { userEmail, orderCode } = req.body;

        if (!userEmail || !orderCode) {
            return res.status(400).json({ message: "Thiếu thông tin userEmail hoặc orderCode." });
        }

        await emailController.sendOrderDeliveredEmail(userEmail, orderCode);
        res.status(200).json({ message: "Email xác nhận giao hàng đã được gửi." });
    } catch (error) {
        console.error("❌ Lỗi khi gửi email:", error);
        res.status(500).json({ message: "Lỗi khi gửi email.", error: error.message });
    }
});

module.exports = router;
