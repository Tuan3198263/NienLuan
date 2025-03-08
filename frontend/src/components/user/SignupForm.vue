<template>
  <div class="signup-container">
    <h2 class="text-center mb-4">Đăng Ký</h2>
    <form @submit.prevent="handleSubmit">
      <!-- Họ và tên -->
      <div class="mb-3">
        <label for="fullName" class="form-label">Họ và tên</label>
        <input
          type="text"
          id="fullName"
          class="form-control"
          v-model="form.fullName"
          placeholder="Nhập họ và tên"
          required
        />
        <small v-if="errors.fullName" class="text-danger">{{
          errors.fullName
        }}</small>
      </div>

      <!-- Email -->
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
          type="email"
          id="email"
          class="form-control"
          v-model="form.email"
          placeholder="Nhập email"
          required
        />
      </div>

      <!-- Số điện thoại -->
      <div class="mb-3">
        <label for="phone" class="form-label">Số điện thoại</label>
        <input
          type="text"
          id="phone"
          class="form-control"
          v-model="form.phone"
          placeholder="Nhập số điện thoại"
          required
        />
        <small v-if="errors.phone" class="text-danger">{{
          errors.phone
        }}</small>
      </div>

      <!-- Mật khẩu -->
      <div class="mb-3 position-relative">
        <label for="password" class="form-label">Mật khẩu</label>
        <input
          :type="passwordVisible ? 'text' : 'password'"
          id="password"
          class="form-control"
          v-model="form.password"
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
        <small v-if="errors.password" class="text-danger">{{
          errors.password
        }}</small>
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

      <!-- Nút đăng ký -->
      <button type="submit" class="btn btn-primary w-100">Đăng Ký</button>
    </form>
    <p class="text-center mt-3">
      Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link>
    </p>
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

export default {
  name: "SignupForm",
  setup() {
    const form = ref({
      fullName: "",
      email: "",
      password: "",
      phone: "",
    });

    const passwordVisible = ref(false);
    const termsAccepted = ref(false);
    const errors = ref({});
    const router = useRouter();
    const toast = useToast();

    // Hàm kiểm tra dữ liệu nhập vào
    const validateForm = () => {
      errors.value = {}; // Xóa lỗi trước đó
      let isValid = true;

      // Kiểm tra họ và tên: không vượt quá 50 ký tự, không chứa ký tự đặc biệt hoặc số
      const nameRegex = /^[A-Za-zÀ-Ỹà-ỹ\s]{1,50}$/;
      if (!nameRegex.test(form.value.fullName)) {
        errors.value.fullName =
          "Tên không được chứa số hoặc ký tự đặc biệt, tối đa 50 ký tự.";
        isValid = false;
      }

      // Kiểm tra số điện thoại Việt Nam (bắt đầu bằng 02-09, có đúng 10 chữ số)
      const phoneRegex = /^(0[2-9]\d{8})$/;
      if (!phoneRegex.test(form.value.phone.trim())) {
        errors.value.phone = "Số điện thoại không hợp lệ.";
        isValid = false;
      }

      // Kiểm tra mật khẩu (tối thiểu 6 ký tự)
      if (form.value.password.length < 6) {
        errors.value.password = "Mật khẩu phải có ít nhất 6 ký tự.";
        isValid = false;
      }

      return isValid;
    };

    const togglePassword = () => {
      passwordVisible.value = !passwordVisible.value;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return; // Nếu có lỗi, không gửi form
      }

      try {
        const response = await axios.post(
          "http://localhost:3000/api/auth/register",
          form.value
        );
        toast.success("Đăng ký thành công");
        router.push("/login");
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi đăng ký");
      }
    };

    return {
      form,
      passwordVisible,
      termsAccepted,
      errors,
      togglePassword,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.signup-container {
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
