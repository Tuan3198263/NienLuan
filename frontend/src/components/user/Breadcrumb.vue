<template>
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <!-- Trang chủ -->
      <li class="breadcrumb-item">
        <router-link class="text-dark text-decoration-none" to="/">
          Trang chủ
        </router-link>
      </li>

      <!-- Breadcrumb cho Danh mục -->
      <li
        v-if="
          currentPath.startsWith('/category') &&
          !currentPath.startsWith('/product')
        "
        class="breadcrumb-item"
      >
        Danh mục
      </li>

      <!-- Breadcrumb cho Sản phẩm -->
      <li v-if="currentPath.startsWith('/product')" class="breadcrumb-item">
        Sản phẩm
      </li>

      <!-- Breadcrumb cho thông tin cá nhân -->
      <li
        v-if="currentPath.startsWith('/profile') && !isProfilePage"
        class="breadcrumb-item"
      >
        <router-link class="text-dark text-decoration-none" to="/profile">
          Thông tin cá nhân
        </router-link>
      </li>

      <!-- Tiêu đề trang hiện tại -->
      <li class="breadcrumb-item active text-dark" aria-current="page">
        {{ pageTitle }}
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

// Lấy route hiện tại
const route = useRoute();

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
});

// Lấy path hiện tại
const currentPath = computed(() => route.path);

// Tiêu đề cho các trang breadcrumb
const pageTitle = computed(() => {
  if (route.path.startsWith("/category")) {
    const slug = route.params.slug;
    const category = props.categories.find((c) => c.slug === slug);
    return category?.name || "Danh mục";
  }
  if (route.path.startsWith("/product")) {
    return "Chi tiết sản phẩm";
  }
  if (route.path.startsWith("/search")) {
    return `Tìm kiếm: ${searchKeyword.value}`;
  }

  if (route.path.startsWith("/cart")) {
    return `Giỏ hàng`;
  }
  if (route.path.startsWith("/brands")) {
    return `Thương hiệu`;
  }
  if (route.path.startsWith("/order-details")) {
    return `Chi tiết đơn hàng`;
  }

  // Các route của trang profile
  if (route.path.startsWith("/profile")) {
    switch (route.path) {
      case "/profile/address":
        return "Địa chỉ";
      case "/profile/orders":
        return "Đơn hàng";
      case "/profile/wishlist":
        return "Sản phẩm yêu thích";
      case "/profile/reviewed":
        return "Sản phẩm đã đánh giá";
      case "/profile/pending-reviews":
        return "Sản phẩm chờ đánh giá";
      default:
        return "Thông tin cá nhân";
    }
  }

  // Giá trị mặc định nếu không có route phù hợp
  return "Trang không xác định";
});

// Kiểm tra xem có phải trang profile chính không
const isProfilePage = computed(() => currentPath.value === "/profile");

// Lấy từ khóa tìm kiếm từ route
const searchKeyword = computed(() => {
  return route.params.keyword ? decodeURIComponent(route.params.keyword) : "";
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
