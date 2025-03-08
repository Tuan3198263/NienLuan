<template>
  <div class="notfound">
    <!-- Thêm biểu tượng hoặc hình ảnh -->
    <div class="icon-container">
      <i class="fas fa-exclamation-triangle fa-5x"></i>
      <!-- Icon cảnh báo -->
    </div>

    <h1>Oops! 404</h1>
    <p>Trang bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
    <router-link to="/" class="home-link">Quay về Trang Chủ</router-link>
  </div>
</template>

<script>
export default {
  name: "NotFound",
};
</script>

<style scoped>
.notfound {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh; /* Đảm bảo chiều cao đầy đủ */
  text-align: center;
  background: linear-gradient(135deg, #f2f2f2, #e0e0e0); /* Gradient nền đẹp */
  padding: 20px;
}

.icon-container {
  margin-bottom: 20px;
  color: #ff6347; /* Màu đỏ cho biểu tượng */
}

.notfound h1 {
  font-size: 6rem;
  margin-bottom: 20px;
  color: #333;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  animation: shake 0.5s ease-in-out;
}

.notfound p {
  font-size: 1.5rem;
  margin-bottom: 30px;
  color: #666;
}

.home-link {
  text-decoration: none;
  font-size: 1.2rem;
  color: #fff;
  background-color: #ff6347; /* Nền đỏ */
  padding: 10px 20px;
  border-radius: 4px;
  transition: background 0.3s, color 0.3s;
  border: 2px solid #ff6347;
}

.home-link:hover {
  background: #fff;
  color: #ff6347;
}

/* Animation for shaking effect */
@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  50% {
    transform: translateX(10px);
  }
  75% {
    transform: translateX(-10px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
