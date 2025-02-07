<template>
  <div class="login-container">
    <h2>Đăng Nhập</h2>
    <form @submit.prevent="handleSubmit">
      <!-- Email -->
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
          type="email"
          id="email"
          v-model="email"
          class="form-control"
          placeholder="Nhập email của bạn"
          required
        />
      </div>

      <!-- Mật khẩu -->
      <div class="mb-3 position-relative">
        <label for="password" class="form-label">Mật khẩu</label>
        <input
          :type="passwordVisible ? 'text' : 'password'"
          id="password"
          v-model="password"
          class="form-control"
          placeholder="Nhập mật khẩu"
          required
        />
        <span
          class="toggle-password"
          @click="togglePassword"
          :title="passwordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
        >
          <i :class="passwordVisible ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
        </span>
      </div>

      <!-- Điều khoản -->
      <div class="form-check mb-3">
        <input
          type="checkbox"
          id="terms"
          v-model="termsAccepted"
          class="form-check-input"
          required
        />
        <label for="terms" class="form-check-label">
          Tôi đồng ý với
          <router-link to="/terms" class="terms-link"
            >Điều khoản sử dụng</router-link
          >
        </label>
      </div>

      <!-- Nút đăng nhập -->
      <button type="submit" class="btn btn-primary w-100">Đăng Nhập</button>
    </form>
    <p class="text-center mt-3">
      Chưa có tài khoản? <router-link to="/signup">Đăng ký</router-link>
    </p>
  </div>
</template>

<script>
import { useAuthStore } from "../../store/AuthStore";
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router"; // Hook để chuyển hướng
import { useToast } from "vue-toastification"; // Hook cho thông báo

export default {
  name: "LoginForm",
  setup() {
    // Khai báo các giá trị state sử dụng ref
    const authStore = useAuthStore(); // Sử dụng store
    const email = ref("");
    const password = ref("");
    const passwordVisible = ref(false);
    const termsAccepted = ref(false);
    const toast = useToast(); // Toastify hook
    const router = useRouter(); // Router hook để chuyển hướng

    // Hàm chuyển đổi hiển thị mật khẩu
    const togglePassword = () => {
      passwordVisible.value = !passwordVisible.value;
    };

    // Hàm xử lý submit form
    const handleSubmit = async () => {
      try {
        // Gửi yêu cầu đăng nhập tới API
        const response = await axios.post(
          "http://localhost:3000/api/auth/login",
          {
            email: email.value,
            password: password.value,
          }
        );

        // Lưu token vào Pinia store và localStorage
        authStore.setAuth(response.data.token);

        // Hiển thị thông báo đăng nhập thành công
        toast.success("Đăng nhập thành công!");

        // Chuyển hướng tới trang Dashboard
        router.push("/");
      } catch (error) {
        // Hiển thị thông báo lỗi đăng nhập
        toast.error(error.response?.data?.message || "Lỗi đăng nhập");
      }
    };

    // Trả về các giá trị và hàm cho template
    return {
      email,
      password,
      passwordVisible,
      termsAccepted,
      togglePassword,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.toggle-password {
  position: absolute;
  top: 73%;
  right: 10px;
  transform: translateY(-50%);
  cursor: pointer;
}

.terms-link {
  color: #007bff;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}
</style>
