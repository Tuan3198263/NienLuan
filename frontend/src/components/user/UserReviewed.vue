<template>
  <div class="bg-white p-4 rounded-lg shadow-md review-container">
    <h2 class="h4 font-weight-bold mb-4">Sản phẩm đã đánh giá</h2>
    <div class="row">
      <div class="col-12">
        <div class="row">
          <!-- Hiển thị khi không có đánh giá -->
          <div
            v-if="paginatedProducts.length === 0"
            class="col-12 text-center py-5"
          >
            <div class="d-flex flex-column align-items-center">
              <i class="fas fa-star fa-5x mb-3 text-muted"></i>
              <p class="h5 text-muted">Bạn chưa đánh giá sản phẩm nào</p>
            </div>
          </div>

          <!-- Card hiển thị sản phẩm đã đánh giá -->
          <div
            v-for="item in paginatedProducts"
            :key="item.product._id"
            class="col-md-4 mb-4"
          >
            <router-link
              :to="`/product/${item.product.slug}`"
              class="text-decoration-none"
            >
              <div class="card shadow-sm border-light rounded">
                <img
                  :src="item.product.images[0]"
                  :alt="item.product.name"
                  class="card-img-top"
                  style="object-fit: cover; height: 200px"
                />
                <div class="card-body">
                  <h6 class="text-muted text-truncate">
                    {{ item.product.brand.name }}
                  </h6>
                  <h5
                    class="card-title text-truncate"
                    style="font-size: 0.9rem"
                  >
                    {{ item.product.name }}
                  </h5>

                  <!-- Hiển thị đánh giá -->
                  <div class="text-warning mb-2">
                    <i
                      v-for="n in 5"
                      :key="n"
                      :class="[
                        'fas',
                        n <= item.review.rating ? 'fa-star' : 'fa-star-o',
                      ]"
                    ></i>
                  </div>

                  <!-- Hiển thị comment -->
                  <p class="text-muted small mb-2">
                    {{ item.review.comment }}
                  </p>

                  <!-- Hiển thị thời gian đánh giá -->
                  <small class="text-muted">
                    Đánh giá vào: {{ formatDate(item.review.createdAt) }}
                  </small>

                  <div class="mt-2">
                    <strong class="text-danger">
                      {{ formatPrice(item.product.price) }} đ
                    </strong>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Phân trang -->
        <nav v-if="products.length > itemsPerPage" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="changePage(currentPage - 1)">
                Trước
              </button>
            </li>
            <li
              v-for="page in totalPages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="changePage(page)">
                {{ page }}
              </button>
            </li>
            <li
              class="page-item"
              :class="{ disabled: currentPage === totalPages }"
            >
              <button class="page-link" @click="changePage(currentPage + 1)">
                Tiếp theo
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../store/AuthStore";
import axios from "axios";
import { useToast } from "vue-toastification";

export default {
  setup() {
    const authStore = useAuthStore();
    const toast = useToast();
    const products = ref([]);
    const currentPage = ref(1);
    const itemsPerPage = 6;

    const formatPrice = (price) => {
      return new Intl.NumberFormat("vi-VN").format(price);
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Lấy danh sách sản phẩm đã đánh giá
    const fetchReviewedProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/reviews/reviewed-products",
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );
        products.value = response.data.reviewedProducts;
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đánh giá:", error);
        toast.error("Không thể tải danh sách đánh giá");
      }
    };

    // Tính tổng số trang
    const totalPages = computed(() => {
      return Math.ceil(products.value.length / itemsPerPage);
    });

    // Danh sách sản phẩm được phân trang
    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      return products.value.slice(start, start + itemsPerPage);
    });

    // Chuyển trang
    const changePage = (page) => {
      if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    onMounted(() => {
      fetchReviewedProducts();
    });

    return {
      products,
      currentPage,
      itemsPerPage,
      totalPages,
      paginatedProducts,
      changePage,
      formatPrice,
      formatDate,
    };
  },
};
</script>

<style scoped>
.rounded-lg {
  border-radius: 10px;
}

.shadow-md {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.review-container {
  min-height: 400px;
  width: 100%;
}

@media (min-width: 992px) {
  .review-container {
    min-width: 830px;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination .page-item {
  list-style: none;
  margin: 0 5px;
}

.pagination .page-link {
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #ddd;
  color: #007bff;
  cursor: pointer;
  border-radius: 4px;
}

.pagination .page-item.disabled .page-link {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.pagination .page-item.active .page-link {
  background-color: #007bff;
  color: white;
}

.pagination .page-link:hover {
  background-color: #0056b3;
  color: white;
}

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}
</style>
