<template>
  <div class="sidebar-container p-4 bg-light rounded shadow-sm">
    <div class="d-flex flex-column align-items-center mb-2 position-relative">
      <!-- Hiển thị ảnh đại diện người dùng -->
      <a :href="avatarUrl" target="_blank">
        <img
          class="rounded-circle avatar border border-secondary mb-3"
          :src="avatarUrl"
          width="80"
          height="80"
          style="cursor: pointer"
        />
      </a>

      <!-- Icon chỉnh sửa xuất hiện bên cạnh ảnh -->
      <div class="edit-icon" @click="triggerAvatarChange">
        <i class="fas fa-edit"></i>
      </div>

      <!-- Nút để tải ảnh mới lên -->
      <input
        type="file"
        @change="handleAvatarChange"
        class="mt-3"
        accept="image/*"
        ref="fileInput"
        style="display: none"
      />
    </div>

    <!-- Danh sách các mục -->
    <ul class="list-group list-group-flush">
      <li class="list-group-item list-group-item-action">
        <router-link
          to="/profile"
          class="d-block w-100 text-dark text-decoration-none"
          active-class="active-link"
        >
          <i class="fas fa-user me-2"></i> Thông tin cá nhân
        </router-link>
      </li>
      <li class="list-group-item list-group-item-action">
        <router-link
          to="/profile/address"
          class="d-block w-100 text-dark text-decoration-none"
          active-class="active-link"
        >
          <i class="fas fa-home me-2"></i> Địa chỉ
        </router-link>
      </li>
      <li class="list-group-item list-group-item-action">
        <router-link
          to="/profile/orders"
          class="d-block w-100 text-dark text-decoration-none"
          active-class="active-link"
        >
          <i class="fas fa-box me-2"></i> Đơn hàng
        </router-link>
      </li>
      <li class="list-group-item list-group-item-action">
        <router-link
          to="/profile/wishlist"
          class="d-block w-100 text-dark text-decoration-none"
          active-class="active-link"
        >
          <i class="fas fa-heart me-2"></i> Yêu thích
        </router-link>
      </li>
      <li class="list-group-item list-group-item-action">
        <router-link
          to="/cart"
          class="d-block w-100 text-dark text-decoration-none"
          active-class="active-link"
        >
          <i class="fas fa-shopping-cart me-2"></i> Giỏ hàng
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "../../store/AuthStore"; // Import store Pinia
import { useToast } from "vue-toastification";

const avatarUrl = ref(""); // Biến để lưu URL ảnh đại diện
const fileInput = ref(null); // Sử dụng ref để trỏ đến input file
const authStore = useAuthStore(); // Khởi tạo store
// Khởi tạo Toast
const toast = useToast();

// Hàm lấy avatar khi component được render
onMounted(async () => {
  try {
    const token = authStore.token; // Lấy token từ Pinia store
    const response = await axios.get("http://localhost:3000/api/auth/avatar", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    avatarUrl.value = response.data.avatar || "default-avatar-url.jpg"; // Nếu không có avatar, sử dụng ảnh mặc định
  } catch (error) {
    console.error("Lỗi khi lấy avatar:", error);
  }
});

// Hàm xử lý thay đổi ảnh đại diện
const handleAvatarChange = async (event) => {
  const file = event.target.files[0]; // Lấy file ảnh người dùng chọn
  if (!file) return;

  const formData = new FormData();
  formData.append("avatar", file); // Thêm file vào formData

  try {
    const token = authStore.token;
    const response = await axios.put(
      "http://localhost:3000/api/auth/update-avatar", // API để cập nhật ảnh đại diện
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào header
          "Content-Type": "multipart/form-data", // Xác định kiểu dữ liệu là formData
        },
      }
    );

    // Cập nhật URL avatar mới
    avatarUrl.value = response.data.avatar;
    toast.success("Cập nhật ảnh đại diện thành công");
  } catch (error) {
    toast.error("Lỗi khi tải ảnh lên:", error);
  }
};

// Hàm gọi để mở cửa sổ chọn ảnh
const triggerAvatarChange = () => {
  fileInput.value.click(); // Dùng ref để gọi phương thức click() trên input
};
</script>

<style scoped>
/* Kiểu dáng đẹp mắt cho sidebar */
/* Thêm background cho sidebar */

.avatar {
  transition: transform 0.3s ease;
}

.edit-icon {
  position: absolute;
  bottom: 12px;
  right: 20px;

  color: black;

  cursor: pointer;
  font-size: 20px;
  z-index: 10;
}

.list-group-item {
  cursor: pointer;
}

.list-group-item:hover {
  background-color: #f1f1f1;
}
</style>
