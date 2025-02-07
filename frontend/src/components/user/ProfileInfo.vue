<template>
  <div class="bg-white p-4 rounded-lg shadow-md" v-if="user">
    <h2 class="h4 font-weight-bold mb-4">Thông tin cá nhân</h2>

    <div class="row g-3">
      <!-- Họ và tên -->
      <div class="col-md-6">
        <label class="form-label">Họ và tên</label>
        <input v-model="user.fullName" class="form-control" type="text" />
      </div>

      <!-- Email -->
      <div class="col-md-6">
        <label class="form-label">Email</label>
        <input
          v-model="user.email"
          class="form-control"
          type="email"
          disabled
        />
      </div>

      <!-- Số điện thoại -->
      <div class="col-md-6">
        <label class="form-label">Số điện thoại</label>
        <input v-model="user.phone" class="form-control" type="text" />
      </div>

      <!-- Mật khẩu mới -->
      <div class="col-md-6">
        <label class="form-label">Mật khẩu</label>
        <input v-model="user.password" class="form-control" type="password" />
      </div>
    </div>

    <div class="d-flex justify-content-end mt-4">
      <button class="btn btn-success" @click="confirmUpdateProfile">
        Lưu thay đổi
      </button>
    </div>
  </div>

  <!-- Show a loading message until user data is available -->
  <div v-else>
    <p>Đang tải thông tin người dùng...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../store/AuthStore"; // Import store Pinia
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import { useToast } from "vue-toastification"; // Import useToast

// Khởi tạo store
const authStore = useAuthStore();

// Khởi tạo user là một đối tượng rỗng
const user = ref({
  fullName: "",
  email: "",
  phone: "",
  password: "",
});

// Khởi tạo Toast
const toast = useToast();

// Hàm để lấy thông tin người dùng từ API
const getUserInfo = async () => {
  try {
    const token = authStore.token; // Lấy token từ Pinia store
    if (!token) {
      toast.error("Token không hợp lệ hoặc chưa đăng nhập!");
      return;
    }

    const response = await axios.get("http://localhost:3000/api/auth/user", {
      headers: {
        Authorization: `Bearer ${token}`, // Lấy token từ Pinia store
      },
    });

    console.log("API response:", response); // Kiểm tra phản hồi từ API

    user.value = response.data.user; // Cập nhật thông tin người dùng vào state
  } catch (error) {
    console.error("Không thể lấy thông tin người dùng:", error);
  }
};

// Hàm để kiểm tra thông tin trước khi gửi
const validateProfile = () => {
  // Kiểm tra số điện thoại (phải bắt đầu bằng 0 và có 10-11 chữ số)
  const phoneRegex = /^0\d{9,10}$/;
  if (!phoneRegex.test(user.value.phone)) {
    toast.error("Số điện thoại không hợp lệ!");
    return false;
  }

  // Kiểm tra mật khẩu (phải từ 6 ký tự trở lên)
  if (user.value.password.length < 6) {
    toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
    return false;
  }

  return true; // Nếu không có lỗi, cho phép tiếp tục
};

// Hàm xác nhận và cập nhật thông tin người dùng
const confirmUpdateProfile = async () => {
  if (!validateProfile()) {
    return; // Nếu thông tin không hợp lệ, không tiếp tục
  }

  const result = await Swal.fire({
    title: "Xác nhận thay đổi?",
    text: "Bạn có chắc chắn muốn lưu thay đổi thông tin cá nhân?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Lưu thay đổi",
    cancelButtonText: "Hủy",
  });

  if (result.isConfirmed) {
    updateProfile();
  }
};

// Hàm để cập nhật thông tin người dùng
const updateProfile = async () => {
  try {
    const token = authStore.token; // Lấy token từ Pinia store
    if (!token) {
      alert("Token không hợp lệ hoặc chưa đăng nhập!");
      return;
    }

    const response = await axios.put(
      "http://localhost:3000/api/auth/update",
      {
        fullName: user.value.fullName,
        phone: user.value.phone,
        password: user.value.password,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Lấy token từ Pinia store
        },
      }
    );

    console.log("Profile updated:", response); // Kiểm tra phản hồi sau khi cập nhật

    // Hiển thị thông báo toast sau khi cập nhật thành công
    toast.success("Thông tin cá nhân đã được cập nhật!");
  } catch (error) {
    console.error("Không thể cập nhật thông tin người dùng:", error);
    toast.error("Đã có lỗi xảy ra khi cập nhật thông tin.");
  }
};

// Gọi API khi component được mounted
onMounted(() => {
  getUserInfo();
});
</script>

<style scoped>
/* Đảm bảo các phần tử form có kiểu dáng đẹp và dễ sử dụng */
/* Đảm bảo các trường nhập liệu không bị tràn ra ngoài */
.form-control {
  word-wrap: break-word; /* Cho phép văn bản dài tự động xuống dòng */
  overflow-wrap: break-word; /* Đảm bảo rằng văn bản dài không vượt qua kích thước của trường */
  max-width: 100%; /* Giới hạn độ rộng tối đa của các trường */
}

.rounded-lg {
  border-radius: 10px;
}

.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
