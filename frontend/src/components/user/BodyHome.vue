<template>
  <main class="body-home">
    <!-- Banner Section with Bootstrap Carousel -->
    <section class="banner">
      <div
        id="carouselExampleControls"
        class="carousel slide"
        data-bs-ride="carousel"
      >
        <div class="carousel-inner">
          <div
            v-for="(banner, index) in bannerItems"
            :key="index"
            class="carousel-item"
            :class="{ active: index === 0 }"
          >
            <img
              :src="banner.imageUrl"
              class="d-block w-100"
              :alt="banner.alt"
            />
          </div>
        </div>
        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleControls"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleControls"
          data-bs-slide="next"
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </section>

    <!-- Product Section -->
    <section class="products-section py-5">
      <div class="container">
        <div
          class="section-header d-flex justify-content-between align-items-center mb-4"
        >
          <h2 class="section-title">Sản phẩm mới</h2>
          <a href="#" class="view-all-link"
            >Xem tất cả <i class="fas fa-arrow-right ms-2"></i
          ></a>
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <p class="mt-2">Đang tải sản phẩm...</p>
        </div>

        <!-- Error message -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          {{ error }}
        </div>

        <!-- Product carousel -->
        <div
          v-else
          id="productCarousel"
          class="carousel slide"
          data-bs-ride="carousel"
        >
          <div class="carousel-inner">
            <div
              v-for="(group, index) in groupedSlides"
              :key="index"
              class="carousel-item"
              :class="{ active: index === 0 }"
            >
              <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
                <div v-for="(product, idx) in group" :key="idx" class="col">
                  <router-link
                    :to="`/product/${product.slug}`"
                    class="text-decoration-none"
                  >
                    <div class="card product-card">
                      <div class="product-img-wrapper">
                        <img
                          :alt="product.name"
                          class="card-img-top product-img"
                          :src="product.img"
                        />
                        <div class="product-overlay">
                          <button class="btn btn-sm btn-light me-2">
                            <i class="fas fa-heart"></i>
                          </button>
                          <button class="btn btn-sm btn-light">
                            <i class="fas fa-shopping-bag"></i>
                          </button>
                        </div>
                        <span
                          v-if="product.stock <= 5 && product.stock > 0"
                          class="product-badge low-stock"
                          >Còn ít</span
                        >
                        <span
                          v-if="product.stock === 0"
                          class="product-badge out-of-stock"
                          >Hết hàng</span
                        >
                      </div>
                      <div class="card-body text-start">
                        <h5 class="product-category">{{ product.category }}</h5>
                        <h4 class="product-name">{{ product.name }}</h4>
                        <p class="product-price">
                          {{ formatPrice(product.price) }}
                        </p>

                        <!-- Rating Stars -->
                        <div class="product-rating">
                          <template v-if="product.rating > 0">
                            <span
                              v-for="n in Math.floor(product.rating)"
                              :key="'star-' + n"
                              class="text-warning"
                            >
                              <i class="fas fa-star"></i>
                            </span>
                            <span
                              v-for="n in 5 - Math.floor(product.rating)"
                              :key="'empty-' + n"
                              class="text-muted"
                            >
                              <i class="fas fa-star"></i>
                            </span>
                          </template>
                          <template v-else>
                            <span
                              v-for="n in 5"
                              :key="'empty-' + n"
                              class="text-muted"
                            >
                              <i class="fas fa-star"></i>
                            </span>
                          </template>
                        </div>
                      </div>
                    </div>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <button
            class="carousel-control-prev custom-carousel-control product-control"
            type="button"
            data-bs-target="#productCarousel"
            data-bs-slide="prev"
          >
            <span class="carousel-control-icon">
              <i class="fas fa-chevron-left"></i>
            </span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button
            class="carousel-control-next custom-carousel-control product-control"
            type="button"
            data-bs-target="#productCarousel"
            data-bs-slide="next"
          >
            <span class="carousel-control-icon">
              <i class="fas fa-chevron-right"></i>
            </span>
            <span class="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Article Cards Section -->
    <section class="articles-section py-5 bg-light">
      <div class="container">
        <div class="section-header text-center mb-5">
          <h2 class="section-title mb-3">Bài Viết Mới Nhất</h2>
          <div class="section-divider mb-3"></div>
          <p class="section-subtitle">
            Các bài viết và mẹo làm đẹp từ các chuyên gia
          </p>
        </div>

        <div class="row">
          <!-- Article cards -->
          <div class="col-md-4 mb-4">
            <div class="card article-card h-100">
              <div class="article-img-wrapper">
                <img
                  src="https://storage.googleapis.com/a1aa/image/Dujt7wgb4OdjQ_hdD5NBgcafAqMQDNI5WDSWvACoqmM.jpg"
                  class="card-img-top"
                  alt="Người phụ nữ đang giữ sản phẩm dưỡng da và mỉm cười"
                />
              </div>
              <div class="card-body">
                <h5 class="article-title">
                  10 Bí Quyết Chăm Sóc Da Để Có Làn Da Rạng Rỡ từ Glowify
                </h5>
                <div
                  class="article-meta d-flex justify-content-between align-items-center text-muted"
                >
                  <p class="card-text mb-0">
                    <i class="fas fa-calendar-alt me-2"></i>05/05/2024
                  </p>
                  <p class="card-text mb-0">
                    <i class="fas fa-user me-2"></i>Thanh Hoa
                  </p>
                </div>
              </div>
              <div class="card-footer bg-white border-0">
                <a href="#" class="btn btn-outline-primary btn-sm">Đọc thêm</a>
              </div>
            </div>
          </div>

          <div class="col-md-4 mb-4">
            <div class="card article-card h-100">
              <div class="article-img-wrapper">
                <img
                  src="https://storage.googleapis.com/a1aa/image/R4FK4MA8qGVjNkCsZQ-H_-7KhfKX4uET0KD9E7zIYOY.jpg"
                  class="card-img-top"
                  alt="Hai phụ nữ đang vui vẻ trang điểm tại bàn"
                />
              </div>
              <div class="card-body">
                <h5 class="article-title">
                  Cẩm Nang Hướng Dẫn Trang Điểm Toàn Diện
                </h5>
                <div
                  class="article-meta d-flex justify-content-between align-items-center text-muted"
                >
                  <p class="card-text mb-0">
                    <i class="fas fa-calendar-alt me-2"></i>20/04/2024
                  </p>
                  <p class="card-text mb-0">
                    <i class="fas fa-user me-2"></i>Minh Anh
                  </p>
                </div>
              </div>
              <div class="card-footer bg-white border-0">
                <a href="#" class="btn btn-outline-primary btn-sm">Đọc thêm</a>
              </div>
            </div>
          </div>

          <div class="col-md-4 mb-4">
            <div class="card article-card h-100">
              <div class="article-img-wrapper">
                <img
                  src="https://storage.googleapis.com/a1aa/image/AvIcVCJktp1UH0CCqTdBHbuuvSQAm0qvLM8Wo-dqwDk.jpg"
                  class="card-img-top"
                  alt="Các chai kem nền và mẫu thử màu"
                />
              </div>
              <div class="card-body">
                <h5 class="article-title">
                  Cách Chọn Màu Kem Nền Hoàn Hảo Cho Làn Da Của Bạn
                </h5>
                <div
                  class="article-meta d-flex justify-content-between align-items-center text-muted"
                >
                  <p class="card-text mb-0">
                    <i class="fas fa-calendar-alt me-2"></i>15/03/2024
                  </p>
                  <p class="card-text mb-0">
                    <i class="fas fa-user me-2"></i>Thùy Linh
                  </p>
                </div>
              </div>
              <div class="card-footer bg-white border-0">
                <a href="#" class="btn btn-outline-primary btn-sm">Đọc thêm</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// Import ảnh banner trực tiếp
import banner1 from "../../assets/banner1.png";
import banner2 from "../../assets/banner2.jpg";
import banner3 from "../../assets/banner3.png";

// State
const productSlides = ref([]);
const loading = ref(true);
const error = ref(null);
const maxProductsToShow = 12; // Limit number of products for homepage

// Banner items data
const bannerItems = [
  {
    imageUrl: banner1,
    alt: "Banner 1",
  },
  {
    imageUrl: banner2,
    alt: "Banner 2",
  },
  {
    imageUrl: banner3,
    alt: "Banner 3",
  },
];

// Computed property
const groupedSlides = computed(() => {
  const chunkSize = 4; // Each slide contains 4 products
  const groups = [];
  for (let i = 0; i < productSlides.value.length; i += chunkSize) {
    groups.push(productSlides.value.slice(i, i + chunkSize));
  }
  return groups;
});

// Methods
const fetchProducts = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await fetch("http://localhost:3000/api/products");

    if (!response.ok) {
      throw new Error("Không thể tải dữ liệu sản phẩm");
    }

    const data = await response.json();

    // Only take a limited number of products for the homepage
    const limitedProducts = data.products.slice(0, maxProductsToShow);

    // Map API products to our component's format
    productSlides.value = limitedProducts.map((product) => ({
      id: product._id,
      category: product.category.name,
      name: product.name,
      img: product.images[0], // Use the first image from the array
      price: product.price,
      rating: product.averageRating || 0,
      stock: product.stock || 0,
      slug: product.slug,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    error.value = "Đã xảy ra lỗi khi tải sản phẩm. Vui lòng thử lại sau.";
  } finally {
    loading.value = false;
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Lifecycle hook
onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
:root {
  --primary-color: #ff6b6b;
  --secondary-color: #f9f9f9;
  --accent-color: #4ecdc4;
  --text-color: #333;
  --light-text: #777;
  --border-radius: 8px;
}

body {
  background-color: #fff;
  color: var(--text-color);
  font-family: "Roboto", "Segoe UI", sans-serif;
}

/* Simplified Banner styling */

.banner {
  margin-bottom: 30px;
}

.banner .carousel-item {
  height: 500px;
}

.banner .carousel-item img {
  object-fit: cover;
  height: 100%;
}

/* Section styling */
.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  position: relative;
  padding-bottom: 10px;
}

.section-header {
  margin-bottom: 2.5rem;
}

.section-divider {
  width: 60px;
  height: 3px;
  background-color: var(--primary-color);
  margin: 0 auto;
}

.section-subtitle {
  color: var(--light-text);
  font-size: 1.1rem;
}

.view-all-link {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.view-all-link:hover {
  color: #e84545;
  text-decoration: none;
}

/* Product cards styling */
.products-section {
  background-color: #ffffff;
}

.product-card {
  border-radius: var(--border-radius);
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  height: 450px;
  margin-bottom: 20px;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.product-img-wrapper {
  position: relative;
  overflow: hidden;
}

.product-img {
  height: 250px;
  object-fit: cover;
  transition: all 0.5s ease;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.product-overlay {
  position: absolute;
  bottom: -50px;
  left: 0;
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
}

.product-card:hover .product-overlay {
  bottom: 0;
  opacity: 1;
}

.product-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.low-stock {
  background-color: #ff9800;
}

.out-of-stock {
  background-color: #f44336;
}

.product-category {
  font-size: 0.9rem;
  color: var(--light-text);
  font-weight: 400;
  margin-bottom: 5px;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  height: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 10px;
  color: var(--text-color);
}

.product-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 10px;
}

.product-rating {
  margin-bottom: 10px;
}

/* Article cards styling */
.articles-section {
  background-color: #f9f9f9;
  padding: 60px 0;
}

.article-card {
  border-radius: var(--border-radius);
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.article-img-wrapper {
  overflow: hidden;
  height: 200px;
}

.article-card img {
  transition: all 0.5s ease;
  height: 100%;
  object-fit: cover;
}

.article-card:hover img {
  transform: scale(1.05);
}

.article-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: var (--text-color);
  line-height: 1.4;
}

.article-meta {
  font-size: 0.85rem;
  color: var(--light-text);
}

/* Custom carousel controls */
.custom-carousel-control {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.7;
}

.product-control {
  background: rgba(0, 0, 0, 0.5);
  width: 35px;
  height: 35px;
}

.carousel-control-icon {
  color: #fff;
  font-size: 1rem;
}

.custom-carousel-control:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .banner .carousel-item {
    height: 300px;
  }

  .banner-title {
    font-size: 2rem;
  }

  .banner-subtitle {
    font-size: 1rem;
  }
}
</style>
