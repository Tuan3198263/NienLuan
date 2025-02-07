<template>
  <Header />
  <div class="container mt-5 d-flex justify-content-center">
    <div class="row">
      <!-- Sidebar bên trái (chiếm 3 phần) -->
      <div class="col-12 col-md-3 p-4 bg-light rounded">
        <SidebarProfile />
      </div>
      <div class="col-12 col-md-9 p-4">
        <!-- Breadcrumb - Điều hướng trang -->
        <Breadcrumb />

        <!-- Phần nội dung chính của trang thông tin cá nhân -->
        <router-view></router-view>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import Footer from "../../components/user/Footer.vue";
import Header from "../../components/user/Header.vue";
import SidebarProfile from "../../components/user/SidebarProfile.vue";
import Breadcrumb from "../../components/user/Breadcrumb.vue";
</script>

<style scoped>
/* Đảm bảo layout có độ rộng và hiển thị cạnh nhau khi kích thước màn hình đủ lớn */

/* Khi kích thước màn hình nhỏ hơn 768px, chuyển đổi sang layout cột */
@media (max-width: 768px) {
  .d-flex {
    flex-direction: column;
  }
}
</style>
