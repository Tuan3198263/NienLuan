const express = require('express');
const router = express.Router();
const chatbotController = require('../controller/chatbotController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin routes - không yêu cầu xác thực (đặt TRƯỚC middleware xác thực)
router.get('/conversations/count', chatbotController.getConversationsCount);
router.delete('/conversations/all', chatbotController.deleteAllConversations);

// Yêu cầu xác thực cho các routes còn lại
router.use(authMiddleware);

// Lấy hoặc tạo phiên chat
router.get('/session', chatbotController.createOrGetSession);

// Gửi tin nhắn đến chatbot và nhận phản hồi
router.post('/message', chatbotController.sendMessage);

// Lấy tất cả phiên chat của người dùng
router.get('/sessions', chatbotController.getUserSessions);

// Xóa một phiên chat
router.delete('/session/:sessionId', chatbotController.deleteSession);

// Xóa tất cả phiên chat của người dùng hiện tại
router.delete('/sessions', chatbotController.deleteAllSessions);

module.exports = router;
