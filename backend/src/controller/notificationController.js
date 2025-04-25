const Notification = require("../models/notification.js");

// 📌 Lấy danh sách thông báo
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách thông báo",
      error: error.message,
    });
  }
};

// 📌 Tạo thông báo mới
const createNotification = async (req, res) => {
  try {
    const { message, icon, type } = req.body;
    const newNotification = new Notification({ message, icon, type });
    await newNotification.save();
    res
      .status(201)
      .json({ success: true, message: "Thông báo đã được tạo!", data: newNotification });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi tạo thông báo",
      error: error.message,
    });
  }
};

// 📌 Đánh dấu thông báo là đã đọc
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.status(200).json({ success: true, message: "Thông báo đã được đánh dấu là đã đọc" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật thông báo",
      error: error.message,
    });
  }
};


// 📌 Đánh dấu tất cả thông báo là đã đọc
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({}, { read: true });
    res.status(200).json({ success: true, message: "Tất cả thông báo đã được đánh dấu là đã đọc" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật tất cả thông báo",
      error: error.message,
    });
  }
};

// 📌 Xóa thông báo
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Thông báo đã bị xóa" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa thông báo",
      error: error.message,
    });
  }
};

// 📌 Xuất các hàm controller
module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead, // Thêm API mới vào danh sách exports
  deleteNotification,
};
