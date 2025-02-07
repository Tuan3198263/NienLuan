<template>
  <div class="sidebar-container p-4 bg-light rounded shadow-sm">
    <div class="d-flex flex-column align-items-center mb-2">
      <img
        class="rounded-circle avatar border border-secondary mb-3"
        src="../../assets/tải xuống.jpg"
        alt="Test Image"
        width="80"
        height="80"
      />
    </div>

    <!-- Danh sách các mục -->
    <ul class="list-group list-group-flush">
      <li class="list-group-item list-group-item-action">
        <router-link
          to="/profile"
          class="d-block w-100 text-dark text-decoration-none"
          active-class="active-link"
        >
          <i class="fas fa-user me-2"></i> Thông tin cá nhân
        </router-link>
      </li>
      <li class="list-group-item list-group-item-action">
        <router-link
          to="/profile/address"
          class="d-block w-100 text-dark text-decoration-none"
          active-class="active-link"
        >
          <i class="fas fa-home me-2"></i> Địa chỉ
        </router-link>
      </li>
      <li class="list-group-item list-group-item-action">
        <router-link
          to="/profile/orders"
          class="d-block w-100 text-dark text-decoration-none"
          active-class="active-link"
        >
          <i class="fas fa-box me-2"></i> Đơn hàng
        </router-link>
      </li>
      <li class="list-group-item list-group-item-action">
        <router-link
          to="/profile/favorites"
          class="d-block w-100 text-dark text-decoration-none"
          active-class="active-link"
        >
          <i class="fas fa-heart me-2"></i> Yêu thích
        </router-link>
      </li>
      <li class="list-group-item list-group-item-action">
        <router-link
          to="/profile/cart"
          class="d-block w-100 text-dark text-decoration-none"
          active-class="active-link"
        >
          <i class="fas fa-shopping-cart me-2"></i> Giỏ hàng
        </router-link>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Kiểu dáng đẹp mắt cho sidebar */
/* Thêm background cho sidebar */
</style>
