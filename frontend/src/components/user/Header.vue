<template>
  <header
    class="d-flex align-items-center justify-content-between p-3 border-bottom"
  >
    <div class="d-flex align-items-center">
      <router-link to="/" class="text-decoration-none">
        <span class="fs-2 fw-bold text-dark">GLOW</span>
        <span class="fs-2 fw-bold text-pink">I</span>
        <span class="fs-2 fw-bold text-dark">FY</span>
      </router-link>
    </div>
    <div class="d-flex align-items-center">
      <!-- Thanh tìm kiếm với biểu tượng bên trong -->
      <div class="search-input-container position-relative me-3">
        <input
          type="text"
          class="form-control search-input"
          placeholder="Search..."
        />
        <i class="fas fa-search search-icon"></i>
      </div>

      <div class="position-relative me-3 cursor-pointer">
        <i class="fas fa-shopping-bag fs-4 text-dark"></i>
        <span
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-pink"
          >3</span
        >
      </div>
      <!-- Hiển thị nút Đăng nhập hoặc Hồ sơ và Đăng xuất -->
      <div class="d-flex align-items-center">
        <!-- Nếu chưa đăng nhập, hiển thị nút Đăng nhập -->
        <router-link v-if="!isLoggedIn" to="/login">
          <i class="fas fa-user fs-4 text-dark me-3"></i>
        </router-link>

        <!-- Nếu đã đăng nhập, hiển thị icon Hồ sơ và Đăng xuất -->
        <div v-if="isLoggedIn" class="d-flex align-items-center">
          <router-link to="/profile">
            <i class="fas fa-user-circle fs-4 text-dark me-3"></i>
          </router-link>
          <div @click="handleLogout">
            <i
              class="fas fa-sign-out-alt fs-4 text-dark me-3 cursor-pointer"
            ></i>
          </div>
        </div>
      </div>

      <div @click="toggleMenu" class="cursor-pointer">
        <i class="fas fa-bars fs-4 text-dark"></i>
      </div>
    </div>
  </header>

  <!-- MENU DROPDOWN -->
  <transition name="slide">
    <div v-if="isMenuOpen" class="dropdown-menu-custom">
      <button class="close-btn btn btn-link" @click="toggleMenu">
        <i class="fas fa-times"></i>
      </button>
      <div class="card-body p-0">
        <div
          class="d-flex justify-content-between align-items-center border-bottom p-3"
        >
          <span class="fs-5 fw-bold text-dark">My Store</span>
        </div>
        <nav class="p-3">
          <ul class="list-unstyled">
            <li class="d-flex justify-content-between align-items-center py-2">
              <router-link to="/" class="text-dark text-decoration-none"
                >Home</router-link
              >
            </li>
            <li class="d-flex justify-content-between align-items-center py-2">
              <router-link to="/blog" class="text-dark text-decoration-none"
                >Blog</router-link
              >
            </li>

            <li class="d-flex justify-content-between align-items-center py-2">
              <router-link to="/brand" class="text-dark text-decoration-none"
                >Brand</router-link
              >
            </li>
            <li
              class="d-flex flex-column py-2 menu-item"
              @click="toggleSubMenu('category')"
            >
              <div class="d-flex justify-content-between align-items-center">
                <span>Category</span>
                <i
                  class="fas fa-chevron-down"
                  :class="{ rotate: isSubMenuOpen('category') }"
                ></i>
              </div>
              <ul v-if="isSubMenuOpen('category')" class="sub-menu">
                <li><a href="#">Category 1</a></li>
                <li><a href="#">Category 2</a></li>
                <li><a href="#">Category 3</a></li>
              </ul>
            </li>
            <li class="d-flex justify-content-between align-items-center py-2">
              <router-link to="/contact" class="text-dark text-decoration-none"
                >Contact</router-link
              >
            </li>
          </ul>
        </nav>
        <div class="d-flex justify-content-center border-top p-3">
          <!-- Facebook -->
          <a href="#" class="text-primary mx-2">
            <i class="fab fa-facebook-f"></i>
          </a>
          <!-- Twitter -->
          <a href="#" class="text-info mx-2">
            <i class="fab fa-twitter"></i>
          </a>
          <!-- Instagram -->
          <a href="#" class="text-danger mx-2">
            <i class="fab fa-instagram"></i>
          </a>
        </div>

        <div
          class="d-flex justify-content-between align-items-center border-top p-3"
        >
          <button class="btn btn-link text-secondary d-flex align-items-center">
            <i class="fas fa-question-circle me-2"></i>
            <span>Trợ giúp</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed } from "vue";
import { useAuthStore } from "../../store/AuthStore"; // Import store Pinia
import Swal from "sweetalert2"; // Import SweetAlert2
import { useToast } from "vue-toastification"; // Import Toast

export default {
  name: "Header",
  setup() {
    const authStore = useAuthStore();
    const toast = useToast(); // Khởi tạo Toast
    const isMenuOpen = ref(false);
    const subMenuState = ref({
      category: false,
    });

    // Kiểm tra trạng thái đăng nhập
    const isLoggedIn = computed(() => authStore.isLoggedIn);

    // Xử lý sự kiện đăng xuất
    const handleLogout = () => {
      // Sử dụng SweetAlert2 để xác nhận đăng xuất
      Swal.fire({
        title: "Bạn chắc chắn muốn đăng xuất?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          // Gọi hành động logout từ Pinia Store
          authStore.logout();

          // Hiển thị thông báo đăng xuất thành công bằng Toast
          toast.success("Đăng xuất thành công!");

          // Bạn có thể điều hướng đến trang login hoặc home sau khi logout
          router.push("/login"); // Hoặc /home tùy vào yêu cầu của bạn
        }
      });
    };

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
    };

    const toggleSubMenu = (menu) => {
      subMenuState.value[menu] = !subMenuState.value[menu];
    };

    const isSubMenuOpen = (menu) => {
      return subMenuState.value[menu];
    };

    return {
      isLoggedIn,
      handleLogout,
      isMenuOpen,
      toggleMenu,
      toggleSubMenu,
      isSubMenuOpen,
    };
  },
};
</script>

<style scoped>
.text-pink {
  color: pink;
}

/* Thanh input tìm kiếm với biểu tượng */
.search-input-container {
  position: relative;
}

.search-input {
  padding-left: 30px;
  width: 200px;
  border-radius: 20px;
  border: 1px solid #ccc;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
}

/* Hiệu ứng trượt ngang cho menu dropdown */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s ease-in-out;
}
.slide-enter {
  transform: translateX(-100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}

/* MENU DROPDOWN */
.dropdown-menu-custom {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 300px;
  background: white;
  box-shadow: 4px 0px 6px rgba(0, 0, 0, 0.1);
  border-right: 1px solid #ddd;
  padding: 15px;
  z-index: 1000;
  overflow-y: auto;
  transition: transform 0.4s ease-in-out;
}

/* Nút đóng */
.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #333;
  position: absolute;
  top: 10px;
  right: 15px;
  cursor: pointer;
}

/* DANH MỤC CON (SUB-MENU) */
.menu-item {
  position: relative;
  cursor: pointer;
}

.menu-item > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub-menu {
  list-style: none;
  padding-left: 15px;
  margin: 8px 0 0 0;
  border-left: 1px solid #ddd;
}

.sub-menu li {
  padding: 8px 0;
}

.sub-menu li a {
  color: #333;
  text-decoration: none;
}

.sub-menu li a:hover {
  color: #ff4081;
}

/* Hiệu ứng quay cho mũi tên */
.fas.fa-chevron-down {
  transition: transform 0.3s ease;
}

.rotate {
  transform: rotate(180deg);
}

/* Cải thiện giao diện dropdown */
.dropdown-menu-custom {
  background-color: #f8f9fa;
  border-radius: 10px;
}

.dropdown-menu-custom .card-body {
  padding: 0;
}

nav ul li {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

nav ul li:hover {
  background-color: #e9ecef;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
