<template>
  <div id="app">
    <Header v-if="!$route.meta.hideHeaderFooter" />
    <router-view />
    <Footer v-if="!$route.meta.hideHeaderFooter" />
  </div>
</template>

<script>
import Header from "./components/user/Header.vue";
import Footer from "./components/user/Footer.vue";

export default {
  components: {
    Header,
    Footer,
  },
};
</script>

<style>
/* CSS toàn cục */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}

body {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}
html,
body {
  height: 100%;
  font-family: "Roboto", sans-serif; /* Sử dụng font Roboto */
  padding-top: 30px;
}

.form-control:focus,
select:focus {
  box-shadow: none !important;
  border-color: #ccc !important; /* Hoặc màu bạn muốn */
}
/* Tùy chỉnh màu nền cho từng loại toast */
.Vue-Toastification__toast--success {
  background: #fff !important;
  border-left: 8px solid #28a745 !important; /* Xanh lá */
  color: #575454 !important;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1) !important;
}

.Vue-Toastification__toast--error {
  background: #fff !important;
  border-left: 8px solid #e04f5d !important; /* Đỏ */
  color: #575454 !important;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1) !important;
}

.Vue-Toastification__toast--info {
  background: #fff !important;
  border-left: 8px solid #007bff !important; /* Xanh dương */
  color: #575454 !important;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1) !important;
}

.Vue-Toastification__toast--warning {
  background: #fff !important;
  border-left: 8px solid #f0ce67 !important; /* Vàng */
  color: #575454 !important;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1) !important;
}

/* Tùy chỉnh khoảng cách và bố cục */
.Vue-Toastification__toast {
  padding: 15px !important;
  display: flex !important;
  align-items: center !important;
  font-weight: 500 !important;
  font-size: 12px !important;
}

/* Nút đóng */
.Vue-Toastification__close-button {
  color: rgb(97, 97, 97) !important;
  font-size: 18px !important;
  opacity: 0.6 !important;
}

.Vue-Toastification__close-button:hover {
  opacity: 1 !important;
}

/* Tùy chỉnh màu icon cho từng loại toast */
.Vue-Toastification__toast--success .Vue-Toastification__icon {
  color: #28a745 !important; /* Xanh lá */
}

.Vue-Toastification__toast--error .Vue-Toastification__icon {
  color: #e04f5d !important; /* Đỏ */
}

.Vue-Toastification__toast--info .Vue-Toastification__icon {
  color: #007bff !important; /* Xanh dương */
}

.Vue-Toastification__toast--warning .Vue-Toastification__icon {
  color: #f0ce67 !important; /* Vàng */
}
/* Đảm bảo icon không bị lệch */
.Vue-Toastification__icon {
  margin-right: 10px !important;
}

/* Xóa focus border khi click */
.pagination .page-link:focus {
  box-shadow: none !important;
}
/* Xóa hiệu ứng viền xanh khi focus */
.form-check-input:focus {
  box-shadow: none !important;
  outline: none !important;
}
@media only screen and (max-width: 488px) {
  .swal2-popup {
    width: 80% !important; /* Giảm chiều rộng hộp thoại */
    max-width: 400px; /* Giới hạn chiều rộng tối đa */
    font-size: 10px; /* Giảm kích thước font chữ */
    padding: 10px; /* Giảm padding để hộp thoại gọn gàng hơn */
  }

  .swal2-title {
    font-size: 16px !important; /* Giảm size tiêu đề */
  }

  .swal2-content {
    font-size: 12px !important; /* Giảm size nội dung */
  }

  .swal2-confirm {
    padding: 8px 16px !important; /* Giảm kích thước nút */
  }
}
</style>
