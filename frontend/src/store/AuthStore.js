// src/store/AuthStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null);
  const isLoggedIn = ref(false);

  // Lưu token vào localStorage và cập nhật trạng thái đăng nhập
  const setAuth = (newToken) => {
    token.value = newToken;
    isLoggedIn.value = true;
    localStorage.setItem('token', newToken); // Lưu token vào localStorage
  };

  // Xóa token và cập nhật trạng thái đăng xuất
  const logout = () => {
    token.value = null;
    isLoggedIn.value = false;
    localStorage.removeItem('token'); // Xóa token khỏi localStorage
  };

  // Kiểm tra xem đã đăng nhập chưa
  const loadAuth = () => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      token.value = savedToken;
      isLoggedIn.value = true;
    }
  };
    // Gọi loadAuth khi store được khởi tạo
  loadAuth();


  // Kiểm tra token hợp lệ (Optional)
  const isValidToken = () => {
    // Bạn có thể thêm logic kiểm tra token hợp lệ ở đây nếu cần
    // Ví dụ: kiểm tra nếu token đã hết hạn
    return token.value !== null;
  };


  return {
    token,
    isLoggedIn,
    setAuth,
    logout,
    loadAuth,
    isValidToken,  // Cung cấp phương thức kiểm tra token hợp lệ
  };
});
