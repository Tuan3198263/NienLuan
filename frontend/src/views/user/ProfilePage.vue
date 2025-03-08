<template>
  <div class="container mt-5 d-flex justify-content-center">
    <div class="row">
      <!-- Sidebar bên trái (chiếm 3 phần) -->
      <div class="col-12 col-md-3 p-4 bg-light rounded">
        <SidebarProfile />
      </div>
      <div class="col-12 col-md-9">
        <!-- Breadcrumb - Điều hướng trang -->
        <Breadcrumb />

        <!-- Phần nội dung chính của trang thông tin cá nhân -->
        <div class="content-wrapper">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SidebarProfile from "../../components/user/SidebarProfile.vue";
import Breadcrumb from "../../components/user/Breadcrumb.vue";
</script>

<style scoped>
/* Đảm bảo layout có độ rộng và hiển thị cạnh nhau khi kích thước màn hình đủ lớn */

/* Đảm bảo responsive tốt */
@media (max-width: 768px) {
  .col-md-3 {
    margin-bottom: 1.5rem;
  }
}
</style>
