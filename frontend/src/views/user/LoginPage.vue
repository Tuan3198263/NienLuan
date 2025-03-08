<template>
  <div class="login-page">
    <!-- Form đăng nhập -->
    <div class="form-container">
      <LoginForm />
    </div>
  </div>
</template>

<script>
// Import Header và LoginForm
import LoginForm from "../../components/user/LoginForm.vue"; // Điều chỉnh lại đường dẫn nếu cần

export default {
  name: "LoginPage",
  components: {
    LoginForm,
  },
};
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 20px;
}

.form-container {
  width: 100%;
  max-width: 450px;
  margin-top: 40px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
