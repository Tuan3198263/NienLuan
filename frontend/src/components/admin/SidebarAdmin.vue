<template>
  <div class="sidebar-admin">
    <!-- Header -->
    <div class="header">
      <div class="header-icons">
        <div
          title="Thông báo"
          class="notification-container"
          @click.stop="toggleNotifications"
        >
          <i class="fas fa-bell"></i>
          <span v-if="unreadCount" class="notification-badge">{{
            unreadCount
          }}</span>
          <!-- Notification Dropdown -->
          <div
            v-if="isNotificationsOpen"
            class="notification-dropdown"
            ref="notificationDropdown"
          >
            <div class="notification-header">
              <h3>Thông báo</h3>
              <button class="mark-all-read" @click="markAllAsRead">
                Đánh dấu đã đọc
              </button>
            </div>
            <div class="notification-list">
              <div v-if="notifications.length === 0" class="no-notifications">
                Không có thông báo nào
              </div>
              <div
                v-for="(notification, index) in notifications"
                :key="notification._id"
                class="notification-item"
                :class="{ unread: !notification.read }"
              >
                <div class="notification-icon">
                  <i :class="notification.icon"></i>
                </div>
                <div class="notification-content" @click="markAsRead(index)">
                  <div class="notification-message">
                    {{ notification.message }}
                  </div>
                  <div class="notification-time">
                    {{ formatTime(notification.time) }}
                  </div>
                </div>
                <div class="notification-actions">
                  <button
                    class="delete-btn"
                    @click.stop="deleteNotification(notification._id)"
                  >
                    <i class="fas fa-times"></i>
                    <!-- Icon dấu "x" thay vì thùng rác -->
                  </button>
                </div>
              </div>
            </div>
            <div class="notification-footer">
              <router-link to="/admin/notifications">Xem tất cả</router-link>
            </div>
          </div>
        </div>
        <div class="message-container">
          <i class="fas fa-envelope"></i>
        </div>
      </div>
      <!-- Cập nhật Avatar với viền tròn -->
      <div class="avatar">
        <img :src="avatarUrl || '/default-avatar.png'" alt="Admin Avatar" />
      </div>
    </div>

    <!-- Hamburger Menu -->
    <button
      class="hamburger-menu"
      @click="toggleSidebar"
      :class="{ 'menu-shift': isSidebarOpen }"
    >
      <i class="fas fa-bars"></i>
    </button>

    <!-- Sidebar -->
    <div class="sidebar" :class="{ open: isSidebarOpen }">
      <!-- Admin Info -->
      <div class="admin-info">
        <i class="fas fa-user-circle"></i>
        <span class="">Tuan Le</span>
      </div>

      <!-- Menu List -->
      <ul class="menu-list">
        <li v-for="menu in menuList" :key="menu.id" class="menu-item">
          <!-- Main Menu -->
          <div @click="handleMenuClick(menu)" class="menu-header">
            <div class="menu-header-content">
              <i :class="menu.icon"></i>
              <span>{{ menu.name }}</span>
            </div>
            <i
              v-if="menu.subMenu"
              class="fas"
              :class="{
                'fa-chevron-down': !menu.isOpen,
                'fa-chevron-up': menu.isOpen,
              }"
            ></i>
          </div>

          <!-- Submenu -->
          <ul v-if="menu.subMenu && menu.isOpen" class="submenu-list">
            <li v-for="sub in menu.subMenu" :key="sub.id">
              <router-link :to="sub.link" class="submenu-item">
                <i :class="sub.icon"></i>
                <span>{{ sub.name }}</span>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useAuthStore } from "../../store/AuthStore"; // Import store Pinia
import { io } from "socket.io-client"; // Import socket.io-client

const avatarUrl = ref(""); // Biến lưu URL ảnh avatar
// Khởi tạo store
const authStore = useAuthStore();
// Khai báo sự kiện emit
const emit = defineEmits();

// Biến lưu kết nối socket
const socket = ref(null);

// Khai báo các biến reactive
const isSidebarOpen = ref(false);

// Danh sách menu
const menuList = ref([
  {
    id: 1,
    name: "Dashboard",
    link: "/admin/dashboard",
    icon: "fas fa-tachometer-alt", // Thay vì 'fa-home', 'fa-tachometer-alt' thường được dùng cho trang Dashboard
  },
  {
    id: 2,
    name: "Thương hiệu",
    icon: "fas fa-tags", // Biểu tượng dành cho thương hiệu

    link: "/admin/brands", // Đường link đến trang Thương hiệu
  },
  {
    id: 3,
    name: "Danh mục sản phẩm",
    icon: "fas fa-clipboard-list", // Biểu tượng dành cho danh mục sản phẩm
    link: "/admin/categories", // Đường link đến trang Danh mục sản phẩm
  },
  {
    id: 4,
    name: "Sản phẩm",
    icon: "fas fa-box-open", // Biểu tượng dành cho sản phẩm
    isOpen: false,
    subMenu: [
      {
        id: 1,
        name: "Danh sách sản phẩm",
        link: "/admin/products/list", // Đường link đến trang danh sách sản phẩm
        icon: "fas fa-box", // Biểu tượng dành cho danh sách sản phẩm
      },
      {
        id: 2,
        name: "Thêm sản phẩm",
        link: "/admin/products/add", // Đường link đến trang thêm sản phẩm
        icon: "fas fa-plus-circle", // Biểu tượng dành cho thêm sản phẩm
      },
    ], // Menu con cho Sản phẩm
  },
  {
    id: 5,
    name: "Khách hàng",
    icon: "fas fa-users-cog", // 'fa-cogs' thường dùng cho cài đặt, 'fa-users-cog' dùng cho quản lý khách hàng
    isOpen: false,
    subMenu: [
      {
        id: 1,
        name: "Thông tin chung", // Đổi từ "Cài đặt chung" thành "Thông tin chung"
        link: "/admin/user/information",
        icon: "fas fa-user", // 'fa-user' hợp lý cho thông tin người dùng
      },
      {
        id: 2,
        name: "Đơn hàng", // Đổi từ "Bảo mật" thành "Đơn hàng"
        link: "/settings/orders", // Cập nhật link cho đơn hàng
        icon: "fas fa-box", // 'fa-box' hợp lý cho biểu tượng đơn hàng
      },
    ],
  },

  {
    id: 6,
    name: "Đơn hàng",
    icon: "fas fa-box", // 'fa-chart-line' dùng cho đồ thị động, 'fa-chart-bar' dùng cho báo cáo tổng quan
    isOpen: false,
    subMenu: [
      {
        id: 1,
        name: "Danh sách đơn hàng",
        link: "/admin/orders/list",
        icon: "fas fa-chart-pie", // 'fa-chart-pie' thích hợp cho báo cáo bán hàng
      },
      {
        id: 2,
        name: "Tìm đơn hàng",
        link: "/admin/orders/search",
        icon: "fas fa-user-check", // 'fa-user-check' phù hợp cho hoạt động người dùng
      },
    ],
  },
  {
    id: 7,
    name: "Chat",
    link: "/admin/chatbot",
    icon: "fas fa-comments", // Biểu tượng phù hợp cho chat
  },
  {
    id: 8,
    name: "Home",
    link: "/",
    icon: "fas fa-home",
  },
]);

// Khởi tạo router
const router = useRouter();

// Hàm lấy avatar từ API
const fetchAvatar = async () => {
  try {
    const token = authStore.token; // Lấy token từ Pinia store
    const response = await axios.get("http://localhost:3000/api/auth/avatar", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    avatarUrl.value = response.data.avatar; // Giả sử API trả về { avatar: "URL_HINH_ANH" }
  } catch (error) {
    console.error("Lỗi khi tải avatar:", error);
    avatarUrl.value = "/default-avatar.png"; // Ảnh mặc định nếu lỗi
  }
};

// Hàm để toggle sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  console.log(isSidebarOpen.value);
  // Phát sự kiện
  localStorage.setItem("isSidebarOpen", JSON.stringify(isSidebarOpen.value));
  emit("toggleSidebar", isSidebarOpen.value);
};

// Hàm xử lý click menu
const handleMenuClick = (menu) => {
  if (menu.subMenu) {
    toggleSubmenu(menu.id);
  } else {
    router.push(menu.link);
  }
};

// Hàm để toggle submenu
const toggleSubmenu = (menuId) => {
  const menu = menuList.value.find((m) => m.id === menuId);
  if (menu) menu.isOpen = !menu.isOpen;
};

// Kiểm tra màn hình nhỏ hơn một kích thước và tự động đóng sidebar
const checkScreenSize = () => {
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false; // Đóng sidebar nếu màn hình nhỏ hơn 768px
    localStorage.setItem("isSidebarOpen", "false"); // Lưu trạng thái vào localStorage
    emit("toggleSidebar", isSidebarOpen.value); // Phát sự kiện khi sidebar bị đóng
  }
};

// Notification related states
const isNotificationsOpen = ref(false);
const notificationDropdown = ref(null);

// Initialize notifications as empty array
const notifications = ref([]);

// Function to fetch notifications from API
const fetchNotifications = async () => {
  try {
    const token = authStore.token;
    const response = await axios.get("http://localhost:3000/api/notifications");

    if (response.data.success) {
      notifications.value = response.data.data;
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
};

// Format time to display in a user-friendly way
const formatTime = (timeString) => {
  const date = new Date(timeString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 60) {
    return `${diffMins} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else {
    return `${diffDays} ngày trước`;
  }
};

// Calculate unread notifications count
const unreadCount = computed(() => {
  return notifications.value.filter((notification) => !notification.read)
    .length;
});

// Toggle notifications dropdown
const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value;

  // Fetch notifications when opening the dropdown
  if (isNotificationsOpen.value) {
    fetchNotifications();
  }
};

// Mark a notification as read
const markAsRead = async (index) => {
  try {
    const notification = notifications.value[index];
    // Update read status on server
    await axios.put(
      `http://localhost:3000/api/notifications/${notification._id}/read`
    );

    // Update local state
    notification.read = true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    // Update all notifications on server
    await axios.put("http://localhost:3000/api/notifications/read-all");

    // Update local state
    notifications.value.forEach((notification) => {
      notification.read = true;
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
};

// Delete a notification
const deleteNotification = async (notificationId) => {
  try {
    // Call API to delete notification
    const response = await axios.delete(
      `http://localhost:3000/api/notifications/${notificationId}`
    );

    if (response.data.success) {
      // Remove from local state
      const index = notifications.value.findIndex(
        (n) => n._id === notificationId
      );
      if (index !== -1) {
        notifications.value.splice(index, 1);
      }

      // Optional: Show success toast
      console.log("Notification deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};

// Close notifications dropdown when clicking outside
const handleClickOutside = (event) => {
  if (
    isNotificationsOpen.value &&
    notificationDropdown.value &&
    !notificationDropdown.value.contains(event.target) &&
    !event.target.classList.contains("fa-bell")
  ) {
    isNotificationsOpen.value = false;
  }
};

// Hàm khởi tạo kết nối Socket.IO
const initSocketConnection = () => {
  // Khởi tạo kết nối đến máy chủ Socket.IO
  socket.value = io("http://localhost:3000");

  // Lắng nghe sự kiện kết nối
  socket.value.on("connect", () => {
    console.log("🔌 Socket.IO đã kết nối thành công!");
  });

  // Lắng nghe sự kiện ngắt kết nối
  socket.value.on("disconnect", () => {
    console.log("🔌 Socket.IO đã ngắt kết nối!");
  });

  // Lắng nghe sự kiện thông báo
  socket.value.on("notification", (data) => {
    console.log("📢 Nhận thông báo mới:", data);

    if (data.action === "new") {
      // Thêm thông báo mới vào đầu danh sách
      notifications.value.unshift(data.notification);

      // Hiển thị toast thông báo
      showNotificationToast(data.notification);
    } else if (data.action === "update") {
      // Cập nhật thông báo
      const index = notifications.value.findIndex(
        (n) => n._id === data.notification._id
      );
      if (index !== -1) {
        notifications.value[index] = data.notification;
      }
    } else if (data.action === "delete") {
      // Xóa thông báo
      const index = notifications.value.findIndex(
        (n) => n._id === data.notificationId
      );
      if (index !== -1) {
        notifications.value.splice(index, 1);
      }
    }
  });
};

// Function to display notification toast
const showNotificationToast = (notification) => {
  // Add implementation for showing toast notification
  // This is a placeholder for the toast functionality
  console.log("Toast notification:", notification.message);
};

// Lấy trạng thái sidebar từ localStorage khi trang được tải lại
onMounted(() => {
  // Kiểm tra kích thước màn hình trước
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false; // Luôn đóng sidebar nếu màn hình nhỏ
    localStorage.setItem("isSidebarOpen", "false");
  } else {
    // Chỉ lấy giá trị từ localStorage nếu màn hình đủ lớn
    const storedSidebarState = localStorage.getItem("isSidebarOpen");
    if (storedSidebarState !== null) {
      isSidebarOpen.value = JSON.parse(storedSidebarState);
    }
  }

  window.addEventListener("resize", checkScreenSize); // Lắng nghe sự kiện resize
  window.addEventListener("click", handleClickOutside); // Add click outside event

  fetchAvatar();
  fetchNotifications(); // Add this line to fetch notifications when component mounts

  // Khởi tạo kết nối Socket.IO
  initSocketConnection();
});

// Dọn dẹp sự kiện resize khi component bị hủy
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
  window.removeEventListener("click", handleClickOutside);

  // Ngắt kết nối Socket.IO khi component bị hủy
  if (socket.value) {
    socket.value.disconnect();
    console.log("🔌 Đã ngắt kết nối Socket.IO");
  }
});
</script>

<style scoped>
/* General Sidebar Styles */
.sidebar-admin {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  z-index: 1000;
}

/* Header */
.header {
  display: flex;
  justify-content: end;
  align-items: center;
  background-color: #f2f9fc;
  color: #adafaf;
  padding: 10px 20px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px; /* Đặt chiều cao cố định */
  z-index: 1100;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin: 0; /* Loại bỏ margin */
}

/* Avatar */
.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%; /* Tạo viền tròn cho avatar */
}

/* Căn chỉnh các icon và avatar bên phải */
.header-icons {
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  gap: 20px;
  order: 1; /* Đảm bảo các icon hiển thị trước avatar */
  align-items: center;
}

.notification-container,
.message-container {
  position: relative;
  display: flex;
  align-items: center;
  height: 24px; /* Consistent height for both containers */
}

.avatar {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  order: 2; /* Đặt avatar ở cuối bên phải */
  margin-left: 20px; /* Thêm khoảng cách giữa avatar và các icon */
}

/* Hamburger Menu */
.hamburger-menu {
  position: fixed;
  top: 10px;
  left: 10px;
  font-size: 1.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 1100;
  transition: left 0.3s ease;
  color: #0c0c0e; /* Màu mặc định của icon */
}

.hamburger-menu.menu-shift {
  top: 70px;
  left: 210px;
  color: rgb(240, 252, 246); /* Màu khi mở sidebar */
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 60px; /* Đặt khớp với chiều cao của header */
  left: 0;
  width: 250px;
  height: calc(100% - 60px); /* Đặt chiều cao từ dưới header */
  background-color: #34495e;
  color: #ecf0f1;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  margin: 0; /* Loại bỏ margin */
  padding: 0; /* Loại bỏ padding */
  overflow-y: auto; /* Thêm thanh cuộn dọc */
}

.sidebar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.sidebar::-webkit-scrollbar-track {
  background: #2c3e50; /* Màu nền phù hợp với sidebar */
  border-radius: 4px;
}
.sidebar::-webkit-scrollbar-thumb {
  background: #95a5a6; /* Màu thumb phù hợp */
  border-radius: 4px;
}
.sidebar::-webkit-scrollbar-thumb:hover {
  background: #7f8c8d;
}

/* Cho Firefox */
.sidebar {
  scrollbar-width: thin;
  scrollbar-color: #95a5a6 #2c3e50;
}

.sidebar.open {
  transform: translateX(0);
}

/* Admin Info */
.admin-info {
  display: flex;
  align-items: center;
  padding: 15px;
  font-size: 1.2rem;
  font-weight: bold;
  position: sticky; /* Để cố định phần này */
  top: 0; /* Đặt nó cố định ở trên cùng */
  z-index: 1100; /* Đảm bảo nó hiển thị trên các phần tử khác */
  width: 100%; /* Chiếm toàn bộ chiều rộng */
  background-color: #2c3e50;
  gap: 10px;
}

.admin-info i {
  margin-right: 10px;
  font-size: 1.5rem;
}

/* Menu List */
.menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-item {
  border-bottom: 1px solid #2c3e50;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  cursor: pointer;
}

.menu-header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-header:hover {
  background-color: #2f7fc0;
}

.submenu-list {
  list-style: none;
  margin: 0;
  padding: 0 0 0 15px;
  background-color: #34495e;
}

.submenu-list li {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  gap: 10px;
}

.submenu-list li:hover {
  background-color: #2f7fc0;
}

/* Xóa định dạng mặc định của router-link trong submenu */
.submenu-item {
  color: #ecf0f1; /* Màu chữ submenu */
  text-decoration: none; /* Xóa gạch chân */
  display: flex; /* Để căn chỉnh icon và text */
  align-items: center; /* Căn giữa icon và text theo chiều dọc */
  gap: 10px; /* Khoảng cách giữa icon và text */
}

.submenu-item i {
  font-size: 1rem; /* Kích thước icon */
}

/* Thêm hiệu ứng hover cho toàn bộ item */
.submenu-list li:hover {
  cursor: pointer;
}

/* Notification Styles */
.notification-container {
  position: relative;
  display: inline-block;
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.notification-dropdown {
  position: absolute;
  top: 40px;
  right: -100px;
  width: 320px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  z-index: 1200;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.notification-header {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.mark-all-read {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 0.8rem;
}

.mark-all-read:hover {
  text-decoration: underline;
}

.notification-list {
  overflow-y: auto;
  max-height: 300px;
}

.notification-item {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f9f9f9;
}

.notification-item.unread {
  background-color: #f0f8ff;
}

.notification-icon {
  margin-right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e1f5fe;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3498db;
}

.notification-content {
  flex: 1;
  cursor: pointer;
}

.notification-message {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 0.75rem;
  color: #999;
}

.notification-actions {
  margin-left: 8px;
  display: flex;
  align-items: center;
}

.delete-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.delete-btn:hover {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
}

.notification-footer {
  padding: 10px;
  text-align: center;
  border-top: 1px solid #eee;
}

.notification-footer a {
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
}

.notification-footer a:hover {
  text-decoration: underline;
}

.no-notifications {
  padding: 20px;
  text-align: center;
  color: #999;
  font-style: italic;
}

/* Make sure icons in header are clickable */
.header-icons i {
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icons i:hover {
  color: #3498db;
}
</style>
