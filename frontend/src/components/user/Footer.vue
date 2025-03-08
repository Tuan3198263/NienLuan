<template>
  <footer class="py-5 bg-dark text-light">
    <div class="container">
      <!-- Logo -->
      <div class="text-center mb-4">
        <span class="fs-2 fw-bold text-white">GL</span>
        <span class="fs-2 fw-bold text-pink">O</span>
        <span class="fs-2 fw-bold text-white">WN</span>
      </div>

      <!-- Footer Links -->
      <div class="row text-center text-md-left">
        <!-- Contact Information Section -->
        <div class="col-12 col-md-3 mb-4">
          <h5 class="font-weight-bold mb-3">CONTACT INFORMATION</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <i class="fas fa-phone-alt mr-2"></i>+1 (555) 123-4567
            </li>
            <li class="mb-2">
              <i class="fas fa-envelope mr-2"></i>cs@glowify.com
            </li>
            <li class="mb-2">
              <i class="fas fa-map-marker-alt mr-2"></i>123 Anywhere Street,
              Anytown USA
            </li>
          </ul>
        </div>

        <!-- My Account Section -->
        <div class="col-12 col-md-2 mb-4">
          <h5 class="font-weight-bold mb-3">MY ACCOUNT</h5>
          <ul class="list-unstyled">
            <li class="mb-2">Sign In</li>
            <li class="mb-2">New Bag</li>
            <li class="mb-2">My Wishlist</li>
            <li class="mb-2">Track My Order</li>
            <li class="mb-2">Help</li>
          </ul>
        </div>

        <!-- Information Section -->
        <div class="col-12 col-md-2 mb-4">
          <h5 class="font-weight-bold mb-3">INFORMATION</h5>
          <ul class="list-unstyled">
            <li class="mb-2">Delivery Information</li>
            <li class="mb-2">Blog</li>
            <li class="mb-2">FAQ</li>
            <li class="mb-2">Contact Us</li>
            <li class="mb-2">Sitemap</li>
          </ul>
        </div>

        <!-- Customer Services Section -->
        <div class="col-12 col-md-2 mb-4">
          <h5 class="font-weight-bold mb-3">CUSTOMER SERVICES</h5>
          <ul class="list-unstyled">
            <li class="mb-2">Shipping & Returns</li>
            <li class="mb-2">Secure Shopping</li>
            <li class="mb-2">International Shipping</li>
            <li class="mb-2">Affiliates</li>
            <li class="mb-2">Contact</li>
          </ul>
        </div>

        <!-- Payment & Shipping Section -->
        <div class="col-12 col-md-3 mb-4">
          <h5 class="font-weight-bold mb-3">PAYMENT & SHIPPING</h5>
          <ul class="list-unstyled">
            <li class="mb-2">Terms of Us</li>
            <li class="mb-2">Payment Methods</li>
            <li class="mb-2">Shipping Guide</li>
            <li class="mb-2">Locations We Ship To</li>
            <li class="mb-2">Estimated Delivery Time</li>
          </ul>
        </div>
      </div>

      <!-- Privacy Policy & Terms Section -->
      <div class="border-top mt-4 pt-3 text-center">
        <p class="text-muted mb-0">Privacy Policy | Terms & Conditions</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
footer {
  background-color: #222;
  color: #fff;
  margin-top: 20px; /* Điều chỉnh padding-top thay vì margin-top */
}
footer .container {
  max-width: 1200px;
}
footer h5 {
  font-size: 1.1rem;
  font-weight: bold;
}
footer ul {
  padding-left: 0;
}
footer ul li {
  font-size: 0.9rem;
  margin-bottom: 10px;
}
footer .text-light {
  color: #ffffff !important;
}
footer .text-pink {
  color: #ff69b4 !important;
}
@media (max-width: 768px) {
  footer {
    display: none;
  }
}
</style>
