<template>
  <div class="signup-page">
    <!-- Signup Form Section -->
    <div class="form-container">
      <SignupAdminForm />
    </div>
  </div>
</template>

<script>
import SignupAdminForm from "../../components/admin/SignupAdminForm.vue";

export default {
  name: "SignupAdminPage",
  components: {
    SignupAdminForm,
  },
};
</script>

<style scoped>
.signup-page {
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
