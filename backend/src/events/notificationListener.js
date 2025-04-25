const Notification = require("../models/notification.js");
const eventEmitter = require("./event.js");
const { getIO } = require("../utils/socketManager");

// 🔥 Lắng nghe sự kiện khi có user mới đăng ký
eventEmitter.on("newUserRegistered", async (user) => {
  try {
    const newNotification = new Notification({
      message: `👤 Khách hàng mới đăng ký: ${user.fullName}`,
      icon: "fas fa-user-plus",
      type: "customer"
    });

    await newNotification.save();
    console.log("📢 Thông báo mới được tạo:", newNotification.message);
    
    // Emit sự kiện qua Socket.io
    getIO().emit('notification', {
      action: 'new',
      notification: newNotification
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo thông báo:", error.message);
  }
});

// 🔥 Lắng nghe sự kiện khi có admin mới đăng ký
eventEmitter.on("newAdminRegistered", async (admin) => {
  try {
    const newNotification = new Notification({
      message: `🛠️ Admin mới: ${admin.fullName}`,
      icon: "fas fa-user-shield",
      type: "other"
    });

    await newNotification.save();
    console.log("📢 Thông báo mới được tạo:", newNotification.message);
    
    // Emit sự kiện qua Socket.io
    getIO().emit('notification', {
      action: 'new',
      notification: newNotification
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo thông báo:", error.message);
  }
});


// 🔥 Lắng nghe sự kiện khi có đơn hàng mới được tạo
eventEmitter.on("orderCreated", async (order) => {
  try {
    const newNotification = new Notification({
      message: `🛒 Đơn hàng mới: Mã đơn hàng #${order.orderCode}`,
      icon: "fas fa-box-open",
      type: "order",
    });

    await newNotification.save();
    console.log("📢 Thông báo mới được tạo:", newNotification.message);
    
    // Emit sự kiện qua Socket.io
    getIO().emit('notification', {
      action: 'new',
      notification: newNotification
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo thông báo:", error.message);
  }
});

// 🔥 Lắng nghe sự kiện khi có đơn hàng bị hủy
eventEmitter.on("orderCanceled", async (order) => {
  try {
    const newNotification = new Notification({
      message: `❌ Đơn hàng bị hủy: Mã đơn hàng #${order.orderCode}`,
      icon: "fas fa-times-circle",
      type: "order",
    });

    await newNotification.save();
    console.log("📢 Thông báo mới được tạo:", newNotification.message);
    
    // Emit sự kiện qua Socket.io
    getIO().emit('notification', {
      action: 'new',
      notification: newNotification
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo thông báo:", error.message);
  }
});


// 🔥 Lắng nghe sự kiện khi đơn hàng giao thành công
eventEmitter.on("orderDelivered", async (order) => {
  try {
    const newNotification = new Notification({
      message: `🚚 Đơn hàng giao thành công: Mã đơn hàng #${order.orderCode}`,
      icon: "fas fa-check-circle",
      type: "order",
    });

    await newNotification.save();
    console.log("📢 Thông báo mới được tạo:", newNotification.message);
    
    // Emit sự kiện qua Socket.io
    getIO().emit('notification', {
      action: 'new',
      notification: newNotification
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo thông báo:", error.message);
  }
});