<!-- src\components\admin\SidebarAdmin.vue-->
<template>
  <div class="sidebar-admin">
    <!-- Header -->
    <div class="header">
      <div class="avatar">
        <img src="" alt="Admin Avatar" />
      </div>
      <div class="header-icons">
        <i class="fas fa-bell"></i>
        <i class="fas fa-envelope"></i>
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
        <span>Admin Name</span>
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// Khai báo sự kiện emit
const emit = defineEmits();

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
    name: "Sản phẩm",
    icon: "fas fa-box-open", // 'fa-users' thường dùng cho người dùng, 'fa-box-open' phù hợp hơn cho sản phẩm
    isOpen: false,
    subMenu: [
      {
        id: 1,
        name: "Thương hiệu",
        link: "/admin/products/brands", // Đổi đường link cho phù hợp với mục "Thương hiệu"
        icon: "fas fa-tags", // 'fa-tags' là biểu tượng thích hợp cho thương hiệu
      },
      {
        id: 2,
        name: "Danh mục sản phẩm",
        link: "/admin/products/categories", // Đảm bảo đường link rõ ràng cho danh mục sản phẩm
        icon: "fas fa-clipboard-list", // 'fa-clipboard-list' là biểu tượng phù hợp cho danh mục sản phẩm
      },
      {
        id: 3,
        name: "Sản phẩm",
        link: "/products/add", // Cập nhật đường link cho trang thêm sản phẩm
        icon: "fas fa-box-open", // 'fa-box-open' là biểu tượng thích hợp cho sản phẩm
      },
    ],
  },
  {
    id: 3,
    name: "Khách hàng",
    icon: "fas fa-users-cog", // 'fa-cogs' thường dùng cho cài đặt, 'fa-users-cog' dùng cho quản lý khách hàng
    isOpen: false,
    subMenu: [
      {
        id: 1,
        name: "Cài đặt chung",
        link: "/settings/general",
        icon: "fas fa-cogs", // 'fa-cogs' vẫn hợp lý cho cài đặt chung
      },
      {
        id: 2,
        name: "Bảo mật",
        link: "/settings/security",
        icon: "fas fa-lock", // 'fa-lock' là biểu tượng cho bảo mật
      },
    ],
  },
  {
    id: 4,
    name: "Logout",
    link: "/logout",
    icon: "fas fa-sign-out-alt", // 'fa-sign-out-alt' là biểu tượng chuẩn cho đăng xuất
  },
  {
    id: 5,
    name: "Đánh giá",
    icon: "fas fa-chart-bar", // 'fa-chart-line' dùng cho đồ thị động, 'fa-chart-bar' dùng cho báo cáo tổng quan
    isOpen: false,
    subMenu: [
      {
        id: 1,
        name: "Báo cáo bán hàng",
        link: "/reports/sales",
        icon: "fas fa-chart-pie", // 'fa-chart-pie' thích hợp cho báo cáo bán hàng
      },
      {
        id: 2,
        name: "Hoạt động người dùng",
        link: "/reports/activity",
        icon: "fas fa-user-check", // 'fa-user-check' phù hợp cho hoạt động người dùng
      },
    ],
  },
  {
    id: 6,
    name: "Hỗ trợ",
    icon: "fas fa-life-ring", // 'fa-headset' là biểu tượng hỗ trợ, nhưng 'fa-life-ring' thường dùng cho hỗ trợ
    link: "/support",
  },
  {
    id: 7,
    name: "Tài liệu API",
    icon: "fas fa-file-code", // 'fa-book' có thể được thay bằng 'fa-file-code' cho tài liệu lập trình
    link: "/api-docs",
  },
]);

// Khởi tạo router
const router = useRouter();

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
// Lấy trạng thái sidebar từ localStorage khi trang được tải lại
onMounted(() => {
  const storedSidebarState = localStorage.getItem("isSidebarOpen");
  if (storedSidebarState !== null) {
    isSidebarOpen.value = JSON.parse(storedSidebarState);
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
  justify-content: space-between;
  align-items: center;
  background-color: #1abc9c;
  color: #ecf0f1;
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

.header .avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.header-icons {
  display: flex;
  gap: 15px;
}

.header-icons i {
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}

/* Hamburger Menu */
.hamburger-menu {
  position: fixed;
  top: 65px;
  left: 10px;
  font-size: 1.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 1100;
  transition: left 0.3s ease;
}

.hamburger-menu.menu-shift {
  left: 190px;
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 60px; /* Đặt khớp với chiều cao của header */
  left: 0;
  width: 250px;
  height: calc(100% - 70px); /* Đặt chiều cao từ dưới header */
  background-color: #34495e;
  color: #ecf0f1;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  margin: 0; /* Loại bỏ margin */
  padding: 0; /* Loại bỏ padding */
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
  background-color: #2c3e50;
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
  background-color: #1abc9c;
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
  background-color: #16a085;
}

/* Xóa định dạng mặc định của router-link trong submenu */
.submenu-item {
  color: #ecf0f1; /* Màu chữ submenu */
  text-decoration: none; /* Xóa gạch chân */
  display: flex; /* Để căn chỉnh icon và text */
  align-items: center; /* Căn giữa icon và text theo chiều dọc */
  gap: 10px; /* Khoảng cách giữa icon và text */
}

.submenu-item:hover {
  background-color: #16a085; /* Màu nền khi hover */
  color: #ffffff; /* Màu chữ khi hover */
}

.submenu-item i {
  font-size: 1rem; /* Kích thước icon */
}

/* Thêm hiệu ứng hover cho toàn bộ item */
.submenu-list li:hover {
  cursor: pointer;
}
</style>
