<template>
  <footer class="bg-dark text-white py-5">
    <div class="container">
      <div class="row">
        <!-- Brand Column -->
        <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
          <h2 class="h4 mb-3">Glown</h2>
          <p class="small mb-3">
            Glown - Bringing affordable luxury to the urban population
          </p>

          <!-- App Store Links -->
          <div class="d-flex flex-column mb-3">
            <a href="#" class="text-white text-decoration-none mb-2">
              <div class="d-flex align-items-center">
                <i class="fab fa-apple me-2 fs-4"></i>
                <div>
                  <div class="small">Get it on the</div>
                  <div>App Store</div>
                </div>
              </div>
            </a>
            <a href="#" class="text-white text-decoration-none">
              <div class="d-flex align-items-center">
                <i class="fab fa-google-play me-2 fs-4"></i>
                <div>
                  <div class="small">Android app on</div>
                  <div>Google Play</div>
                </div>
              </div>
            </a>
          </div>

          <!-- Hotline -->
          <div class="mb-3">
            <div>Hotline: <span class="fw-bold">1800 1234</span></div>
          </div>

          <!-- Social Media Icons -->
          <div class="d-flex gap-3">
            <a href="#" class="text-white">
              <i class="fab fa-facebook-f fs-5"></i>
            </a>
            <a href="#" class="text-white">
              <i class="fab fa-instagram fs-5"></i>
            </a>
            <a href="#" class="text-white">
              <i class="fab fa-facebook-messenger fs-5"></i>
            </a>
            <a href="#" class="text-white">
              <i class="fab fa-pinterest fs-5"></i>
            </a>
            <a href="#" class="text-white">
              <i class="fab fa-tiktok fs-5"></i>
            </a>
          </div>
        </div>

        <!-- Categories Column -->
        <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
          <h5 class="mb-3">Danh mục</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none">Quà tặng</a>
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Hộp làm đẹp</a
              >
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none">Phụ kiện</a>
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Chăm sóc da</a
              >
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none">Trang điểm</a>
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Thực phẩm chức năng</a
              >
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Chăm sóc cá nhân</a
              >
            </li>
          </ul>
        </div>

        <!-- Guidelines Column -->
        <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
          <h5 class="mb-3">Hướng dẫn</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >HDSD & Bảo hành</a
              >
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Hướng dẫn đặt hàng</a
              >
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Phương thức giao hàng</a
              >
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Chính sách đổi trả</a
              >
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Chính sách bảo mật</a
              >
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Privacy Info</a
              >
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Điều khoản sử dụng</a
              >
            </li>
          </ul>
        </div>

        <!-- Information Column -->
        <div class="col-lg-3 col-md-6">
          <h5 class="mb-3">Thông tin</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Giới thiệu về Glown</a
              >
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none">Tuyển dụng</a>
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Chương trình GlownCoin</a
              >
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Hỗ trợ Đơn hàng</a
              >
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Hệ thống cửa hàng Glown</a
              >
            </li>
            <li class="mb-2">
              <a href="#" class="text-white text-decoration-none"
                >Mời bạn bè - Nhận thưởng ngay</a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Back to top button -->
  </footer>
</template>

<script>
export default {
  name: "GlownFooter",
  methods: {
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  },
};
</script>

<style scoped>
/* Custom styles to complement Bootstrap */
footer {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.qr-code {
  border: 1px solid #ccc;
}

/* Hover effects for links */
a.text-white:hover {
  opacity: 0.8;
  text-decoration: underline !important;
}

/* Back to top button hover effect */
.btn-dark:hover {
  background-color: #343a40;
}

/* Hide footer on small screens */
@media screen and (max-width: 760px) {
  footer {
    display: none;
  }
}
</style>
