<template>
  <Header />
  <div class="signup-page">
    <!-- Signup Form Section -->
    <div class="form-container">
      <SignupForm />
    </div>
  </div>
</template>

<script>
import Header from "../../components/user/Header.vue"; // Import Header component
import SignupForm from "../../components/user/SignupForm.vue"; // Import SignupForm component

export default {
  name: "SignupPage",
  components: {
    Header,
    SignupForm,
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
  background-color: #f7f7f7;
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
