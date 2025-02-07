<template>
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item">
        <router-link class="text-dark text-decoration-none" to="/"
          >Trang chủ</router-link
        >
      </li>
      <li class="breadcrumb-item" v-if="currentPath !== '/profile'">
        <router-link class="text-dark text-decoration-none" to="/profile"
          >Thông tin cá nhân</router-link
        >
      </li>
      <li class="breadcrumb-item active text-dark" aria-current="page">
        {{ pageTitle }}
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// Lấy path hiện tại
const currentPath = computed(() => route.path);

// Định nghĩa tiêu đề breadcrumb
const pageTitle = computed(() => {
  switch (route.path) {
    case "/profile/address":
      return "Địa chỉ";
    case "/profile/orders":
      return "Đơn hàng";
    case "/profile/favorites":
      return "Yêu thích";
    case "/profile/cart":
      return "Giỏ hàng";
    default:
      return "Thông tin cá nhân";
  }
});
</script>

<style scoped>
.breadcrumb {
  background-color: transparent;
  padding: 0;
  margin-bottom: 1rem;
}

/* Màu chữ xám nhạt cho breadcrumb */
.breadcrumb-item {
  color: #6c757d !important; /* Bootstrap màu xám nhạt */
}

/* Đổi màu liên kết breadcrumb */
.breadcrumb-item a {
  color: #6c757d !important;
  text-decoration: none;
}

/* Màu xám nhạt cho dấu phân cách ">" */
.breadcrumb-item + .breadcrumb-item::before {
  content: ">";
  padding: 0 8px;
  color: #6c757d !important;
}
</style>
