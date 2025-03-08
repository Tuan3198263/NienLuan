<template>
  <header
    class="d-flex align-items-center justify-content-between p-2 border-bottom fixed-header"
  >
    <div class="d-flex align-items-center" title="Glown">
      <router-link to="/" class="text-decoration-none">
        <span class="fs-2 fw-bold text-dark">GL</span>
        <span class="fs-2 fw-bold text-pink">O</span>
        <span class="fs-2 fw-bold text-dark">WN</span>
      </router-link>
    </div>
    <div class="d-flex align-items-center">
      <!-- Thanh tìm kiếm -->
      <div class="search-input-container position-relative me-3">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control search-input"
          placeholder="Search..."
          @keyup.enter="handleSearch"
        />
        <i
          class="fas fa-search search-icon cursor-pointer"
          @click="handleSearch"
        ></i>
      </div>

      <div class="position-relative me-3 cursor-pointer" @click="goToCart">
        <i
          class="fas fa-shopping-bag fs-4 text-dark"
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          title="Giỏ hàng"
        ></i>
      </div>

      <!-- Hiển thị nút Đăng nhập hoặc Hồ sơ và Đăng xuất -->
      <div class="d-flex align-items-center">
        <!-- Nếu chưa đăng nhập, hiển thị nút Đăng nhập -->
        <router-link v-if="!isLoggedIn" to="/login">
          <i
            class="fas fa-user fs-4 text-dark me-3"
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
            title="Đăng nhập"
          ></i>
        </router-link>

        <!-- Nếu đã đăng nhập, chỉ hiển thị ảnh đại diện và icon Đăng xuất -->
        <div v-if="isLoggedIn" class="d-flex align-items-center">
          <!-- Hiển thị ảnh đại diện người dùng và dẫn đến trang hồ sơ -->
          <div v-if="avatarUrl" class="position-relative" @click="goToProfile">
            <img
              :src="avatarUrl"
              alt="Avatar"
              class="rounded-circle cursor-pointer me-3"
              width="30"
              height="30"
              title="Hồ sơ"
            />
          </div>

          <!-- Icon đăng xuất -->
          <div @click="handleLogout">
            <i
              class="fas fa-sign-out-alt fs-4 text-dark me-3 cursor-pointer"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Đăng xuất"
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
          <span class="fs-5 fw-bold text-dark">Glown</span>
        </div>
        <nav class="p-3">
          <ul class="list-unstyled">
            <li class="d-flex justify-content-between align-items-center py-2">
              <router-link to="/" class="text-dark text-decoration-none"
                >Trang chủ</router-link
              >
            </li>

            <li class="d-flex justify-content-between align-items-center py-2">
              <router-link to="/brand" class="text-dark text-decoration-none"
                >Thương hiệu</router-link
              >
            </li>
            <li
              class="d-flex flex-column py-2 menu-item"
              @click="toggleSubMenu('category')"
            >
              <div class="d-flex justify-content-between align-items-center">
                <span>Danh mục</span>
                <i
                  class="fas fa-chevron-down"
                  :class="{ rotate: isSubMenuOpen('category') }"
                ></i>
              </div>
              <ul v-if="isSubMenuOpen('category')" class="sub-menu">
                <li>
                  <router-link to="/category/cham-soc-da"
                    >Chăm sóc da</router-link
                  >
                </li>
                <li>
                  <router-link to="/category/cham-soc-ca-nhan"
                    >Chăm sóc cá nhân</router-link
                  >
                </li>
                <li>
                  <router-link to="/category/trang-diem"
                    >Trang điểm</router-link
                  >
                </li>
                <li>
                  <router-link to="/category/phu-kien">Phụ kiện</router-link>
                </li>
              </ul>
            </li>
            <li class="d-flex justify-content-between align-items-center py-2">
              <router-link to="/contact" class="text-dark text-decoration-none"
                >Liên hệ</router-link
              >
            </li>
          </ul>
        </nav>
        <div class="d-flex justify-content-center border-top p-3">
          <!-- Facebook -->
          <a
            href="https://www.facebook.com/profile.php?id=100009262266133"
            class="text-primary mx-2"
            target="_blank"
          >
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
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { useAuthStore } from "../../store/AuthStore"; // Import store Pinia
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import { useToast } from "vue-toastification"; // Import Toast

export default {
  name: "Header",
  setup() {
    const route = useRoute(); // Lấy thông tin route hiện tại
    const authStore = useAuthStore();
    const router = useRouter();
    const toast = useToast(); // Khởi tạo Toast
    const isMenuOpen = ref(false);
    const subMenuState = ref({
      category: false,
    });

    // Kiểm tra trạng thái đăng nhập
    const isLoggedIn = computed(() => authStore.isLoggedIn);
    const searchQuery = ref(""); // Thêm biến lưu giá trị tìm kiếm
    const avatarUrl = ref(""); // Biến lưu URL ảnh đại diện

    // Hàm gọi API lấy ảnh đại diện nếu đã đăng nhập
    onMounted(async () => {
      if (isLoggedIn.value) {
        try {
          const token = authStore.token; // Lấy token từ Pinia store
          const response = await axios.get(
            "http://localhost:3000/api/auth/avatar",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          avatarUrl.value = response.data.avatar || "default-avatar-url.jpg"; // Nếu không có avatar, dùng ảnh mặc định
        } catch (error) {
          console.error("Lỗi khi lấy avatar:", error);
        }
      }
    });

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
          toast.success("Đăng xuất thành công");

          // Bạn có thể điều hướng đến trang login hoặc home sau khi logout
          router.push("/login"); // Hoặc /home tùy vào yêu cầu của bạn
        }
      });
    };

    // Hàm xử lý tìm kiếm
    const handleSearch = () => {
      if (searchQuery.value.trim() !== "") {
        router.push(`/search/${encodeURIComponent(searchQuery.value.trim())}`);
      }
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

    // Điều hướng đến trang hồ sơ
    const goToProfile = () => {
      router.push("/profile");
    };

    // Phương thức goToCart
    const goToCart = () => {
      if (isLoggedIn.value) {
        // Nếu người dùng đã đăng nhập, điều hướng đến trang giỏ hàng
        router.push("/cart");
      } else {
        // Nếu chưa đăng nhập, chuyển hướng đến trang login
        toast.info("Vui lòng đăng nhập");
        router.push({ name: "LoginPage", query: { redirect: "/cart" } });
      }
    };

    // Theo dõi sự thay đổi của route và reset searchQuery nếu không phải ProductSearchPage
    watch(
      () => route.path,
      (newPath) => {
        if (!newPath.startsWith("/search")) {
          searchQuery.value = "";
        }
      }
    );

    // Theo dõi sự thay đổi của isLoggedIn
    watch(
      () => isLoggedIn.value,
      async (newVal) => {
        if (newVal) {
          try {
            const token = authStore.token; // Lấy token từ Pinia store
            const response = await axios.get(
              "http://localhost:3000/api/auth/avatar",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            avatarUrl.value = response.data.avatar || "default-avatar-url.jpg"; // Cập nhật avatar
          } catch (error) {
            console.error("Lỗi khi lấy avatar:", error);
          }
        } else {
          avatarUrl.value = ""; // Nếu chưa đăng nhập, xóa avatar
        }
      }
    );

    return {
      isLoggedIn,
      avatarUrl,
      handleLogout,
      isMenuOpen,
      toggleMenu,
      toggleSubMenu,
      isSubMenuOpen,
      searchQuery, // Thêm biến vào return để binding với input
      handleSearch, // Thêm hàm xử lý tìm kiếm
      goToProfile,
      goToCart,
    };
  },
};
</script>

<style scoped>
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* Ensure it is above other content */
  background-color: white; /* Optional: ensures the header stays visible */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Optional: adds shadow for visibility */
}

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

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
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
  /* Xóa transform mặc định ở đây */
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
  color: #6fb5ca;
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
/* Ẩn search input khi màn hình nhỏ (ví dụ, nhỏ hơn 768px) */
@media (max-width: 768px) {
  .search-input-container {
    width: 100px; /* Hoặc điều chỉnh theo mong muốn */
  }

  .search-input {
    width: 100%;
  }
}
</style>
