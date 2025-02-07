<template>
  <div>
    <!-- Sidebar -->
    <SidebarAdmin
      :isSidebarOpen="isSidebarOpen"
      @toggleSidebar="toggleSidebar"
    />

    <!-- Nội dung chính -->
    <div class="content" :class="{ 'full-width': !isSidebarOpen }">
      <!-- Router view để hiển thị các trang con -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import SidebarAdmin from "../../components/admin/SidebarAdmin.vue";
import { ref, onMounted } from "vue";

export default {
  components: {
    SidebarAdmin,
  },
  setup() {
    // Kiểm tra trạng thái sidebar trong localStorage
    const isSidebarOpen = ref(localStorage.getItem("sidebarOpen") === "true");

    // Hàm để toggle sidebar
    const toggleSidebar = (isOpen) => {
      isSidebarOpen.value = isOpen;
      // Lưu trạng thái vào localStorage
      localStorage.setItem("sidebarOpen", isSidebarOpen.value);
    };

    return {
      isSidebarOpen,
      toggleSidebar,
    };
  },
};
</script>

<style scoped>
/* Nội dung chính được đẩy sang phải khi sidebar mở */
.content {
  margin-top: 50px;
  margin-left: 250px; /* Tương ứng với chiều rộng của sidebar khi sidebar mở */
  padding: 20px;
  transition: margin-left 0.3s ease;
}

/* Khi sidebar đóng, content chiếm toàn bộ chiều rộng */
.content.full-width {
  margin-left: 0;
  width: 100%; /* Đảm bảo rằng content chiếm toàn bộ chiều rộng khi sidebar đóng */
}
</style>
