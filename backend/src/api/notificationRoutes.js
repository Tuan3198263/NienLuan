const express = require("express");
const Notifications = require("../controller/notificationController.js");

const router = express.Router();

// 📌 Lấy danh sách thông báo
router.get("/", Notifications.getNotifications);

// 📌 Thêm thông báo mới
router.post("/", Notifications.createNotification);

// 📌 Đánh dấu thông báo là đã đọc (Fix lỗi thiếu dấu chấm)
router.put("/:id/read", Notifications.markAsRead);

router.put("/read-all", Notifications.markAllAsRead); // Thêm route mới

// 📌 Xóa thông báo
router.delete("/:id", Notifications.deleteNotification);

module.exports = router;
