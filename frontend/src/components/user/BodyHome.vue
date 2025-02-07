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
          <div class="carousel-item active">
            <img
              src="https://static0.gamerantimages.com/wordpress/wp-content/uploads/2022/03/Attack-on-Titan-Reiner-Braun-Sad-Moments.jpg"
              class="d-block w-100"
              alt="Banner 1"
            />
          </div>
          <div class="carousel-item">
            <img
              src="https://staticg.sportskeeda.com/editor/2023/11/1f114-16999636013931-1920.jpg"
              class="d-block w-100"
              alt="Banner 2"
            />
          </div>
          <div class="carousel-item">
            <img
              src="https://a.storyblok.com/f/178900/640x360/ec45e80cb7/759b1dcfad9ce6ef675919b48052c0be1644997413_main.jpg/m/filters:quality(95)format(webp)"
              class="d-block w-100"
              alt="Banner 3"
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
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fw-bold">Sản phẩm mới</h2>
        <a href="#" class="text-muted">Xem tất cả</a>
      </div>
      <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          <div
            v-for="(group, index) in groupedSlides"
            :key="index"
            class="carousel-item"
            :class="{ active: index === 0 }"
          >
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
              <div v-for="(product, idx) in group" :key="idx" class="col">
                <div class="card shadow-lg rounded">
                  <img
                    :alt="product.name"
                    class="card-img-top product-img"
                    :src="product.img"
                  />
                  <div class="card-body text-start">
                    <h5 class="card-title text-muted">
                      {{ product.category }}
                    </h5>
                    <h4 class="card-title font-weight-semibold mb-2">
                      {{ product.name }}
                    </h4>
                    <p class="card-text h5 font-weight-bold mb-2">
                      ${{ product.price }}
                    </p>

                    <!-- Add Rating (Stars) -->
                    <div class="mb-2">
                      <template
                        v-if="
                          product.rating !== null &&
                          product.rating !== undefined
                        "
                      >
                        <span
                          v-for="n in product.rating"
                          :key="'star-' + n"
                          class="text-warning"
                        >
                          <i class="fas fa-star"></i>
                        </span>
                        <span
                          v-for="n in 5 - product.rating"
                          :key="'empty-' + n"
                          class="text-muted"
                        >
                          <i class="fas fa-star"></i>
                        </span>
                      </template>
                      <span v-else class="text-muted">Chưa có đánh giá</span>
                    </div>

                    <!-- Add Sold Quantity -->
                    <p class="card-text text-muted">
                      <i class="fas fa-shopping-cart me-2"></i>
                      {{ product.sold ?? 0 }} sold
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#productCarousel"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#productCarousel"
          data-bs-slide="next"
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>

    <!-- Article Cards Section -->
    <div class="container">
      <h2 class="fw-bold mb-4">Bài Viết Mới Nhất</h2>
      <!-- Tiêu đề phần -->
      <div class="row">
        <!-- Card 1 -->
        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-lg rounded">
            <img
              src="https://storage.googleapis.com/a1aa/image/Dujt7wgb4OdjQ_hdD5NBgcafAqMQDNI5WDSWvACoqmM.jpg"
              class="card-img-top"
              alt="A woman holding a skincare product and smiling"
            />
            <div class="card-body">
              <h5 class="card-title">
                10 Skincare Tips for a Healthy Glow from Glowify
              </h5>
              <div
                class="d-flex justify-content-between align-items-center text-muted"
              >
                <p class="card-text">
                  <i class="fas fa-calendar-alt mr-2"></i>May 5, 2024
                </p>
                <p class="card-text">
                  <i class="fas fa-user mr-2"></i>Diana Jones
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- Card 2 -->
        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-lg rounded">
            <img
              src="https://storage.googleapis.com/a1aa/image/R4FK4MA8qGVjNkCsZQ-H_-7KhfKX4uET0KD9E7zIYOY.jpg"
              class="card-img-top"
              alt="Two women happily applying makeup at a table"
            />
            <div class="card-body">
              <h5 class="card-title">
                The Ultimate Guide to Makeup Application
              </h5>
              <div
                class="d-flex justify-content-between align-items-center text-muted"
              >
                <p class="card-text">
                  <i class="fas fa-calendar-alt mr-2"></i>April 20, 2024
                </p>
                <p class="card-text">
                  <i class="fas fa-user mr-2"></i>Fabian Wright
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- Card 3 -->
        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-lg rounded">
            <img
              src="https://storage.googleapis.com/a1aa/image/AvIcVCJktp1UH0CCqTdBHbuuvSQAm0qvLM8Wo-dqwDk.jpg"
              class="card-img-top"
              alt="Various foundation bottles and swatches"
            />
            <div class="card-body">
              <h5 class="card-title">
                How to Choose the Perfect Foundation Shade
              </h5>
              <div
                class="d-flex justify-content-between align-items-center text-muted"
              >
                <p class="card-text">
                  <i class="fas fa-calendar-alt mr-2"></i>March 15, 2024
                </p>
                <p class="card-text">
                  <i class="fas fa-user mr-2"></i>Lisa Dominic
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  data() {
    return {
      productSlides: [
        {
          category: "Haircare",
          name: "Curl Defining Cream",
          img: "https://storage.googleapis.com/a1aa/image/YKgt7hydhWhOWHC2nJwlww2rM3ed5r6yCUrmjWzric0.jpg",
          price: 24.99,
          rating: 4,
          sold: 150,
        },
        {
          category: "Haircare",
          name: "Curl Defining Cream",
          img: "https://storage.googleapis.com/a1aa/image/YKgt7hydhWhOWHC2nJwlww2rM3ed5r6yCUrmjWzric0.jpg",
          price: 24.99,
          rating: 4,
          sold: 150,
        },
        {
          category: "Haircare",
          name: "Curl Defining Cream",
          img: "https://storage.googleapis.com/a1aa/image/YKgt7hydhWhOWHC2nJwlww2rM3ed5r6yCUrmjWzric0.jpg",
          price: 24.99,
          rating: 4,
          sold: 150,
        },
        {
          category: "Haircare",
          name: "Curl Defining Cream",
          img: "https://storage.googleapis.com/a1aa/image/YKgt7hydhWhOWHC2nJwlww2rM3ed5r6yCUrmjWzric0.jpg",
          price: 24.99,
          rating: 4,
          sold: 150,
        },
        {
          category: "Haircare",
          name: "Curl Defining Cream",
          img: "https://storage.googleapis.com/a1aa/image/YKgt7hydhWhOWHC2nJwlww2rM3ed5r6yCUrmjWzric0.jpg",
          price: 24.99,
          rating: 4,
          sold: 150,
        },
        {
          category: "Haircare",
          name: "Curl Defining Cream",
          img: "https://storage.googleapis.com/a1aa/image/YKgt7hydhWhOWHC2nJwlww2rM3ed5r6yCUrmjWzric0.jpg",
          price: 24.99,
          rating: 4,
          sold: 150,
        },
      ],
    };
  },
  computed: {
    groupedSlides() {
      const chunkSize = 4; // Mỗi slide chứa 4 sản phẩm
      const groups = [];
      for (let i = 0; i < this.productSlides.length; i += chunkSize) {
        groups.push(this.productSlides.slice(i, i + chunkSize));
      }
      return groups;
    },
  },
};
</script>

<style scoped>
body {
  background-color: #f8f9fa;
}

.card-img-top {
  object-fit: cover;
  height: 300px;
}

.card {
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-10px);
}

.banner {
  margin-bottom: 30px;
}

.carousel-item img {
  max-height: 500px;
  object-fit: cover;
}

.product-img {
  height: 250px;
  object-fit: cover;
}

.card-title {
  font-size: 1.2rem;
}

.card-body {
  padding: 15px;
}

.card-body .card-title {
  font-weight: bold;
}

.card-body .card-text {
  font-size: 1.1rem;
}

.carousel-control-prev,
.carousel-control-next {
  width: 5%; /* Giảm bề rộng của các nút */
  top: 50%; /* Đặt nút ở giữa chiều cao của carousel */
  transform: translateY(-50%);
  border-radius: 50%; /* Làm tròn các nút */
}

.carousel-control-prev {
  left: 10px; /* Di chuyển nút "Previous" sát bên trái */
}

.carousel-control-next {
  right: 10px; /* Di chuyển nút "Next" sát bên phải */
}
</style>
