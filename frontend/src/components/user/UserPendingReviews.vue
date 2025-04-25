<template>
  <div class="bg-white p-4 rounded-lg shadow-md review-container">
    <h2 class="h4 font-weight-bold mb-4">Sản phẩm chờ đánh giá</h2>
    <div class="row">
      <div class="col-12">
        <div class="row">
          <!-- Hiển thị khi không có sản phẩm chờ đánh giá -->
          <div
            v-if="paginatedProducts.length === 0"
            class="col-12 text-center py-5"
          >
            <div class="d-flex flex-column align-items-center">
              <i class="fas fa-clipboard-check fa-5x mb-3 text-muted"></i>
              <p class="h5 text-muted">Không có sản phẩm nào chờ đánh giá</p>
            </div>
          </div>

          <!-- Card hiển thị sản phẩm chờ đánh giá -->
          <div
            v-for="item in paginatedProducts"
            :key="item.product._id"
            class="col-md-4 mb-4"
          >
            <div class="card shadow-sm border-light rounded h-100">
              <router-link
                :to="`/product/${item.product.slug}`"
                class="text-decoration-none"
              >
                <img
                  :src="item.product.images[0]"
                  :alt="item.product.name"
                  class="card-img-top"
                  style="object-fit: cover; height: 200px"
                />
              </router-link>
              <div class="card-body d-flex flex-column">
                <router-link
                  :to="`/product/${item.product.slug}`"
                  class="text-decoration-none text-dark"
                >
                  <h6 class="text-muted text-truncate">
                    {{ item.product.brand.name }}
                  </h6>
                  <h5
                    class="card-title text-truncate"
                    style="font-size: 0.9rem"
                  >
                    {{ item.product.name }}
                  </h5>
                </router-link>

                <div class="mt-2">
                  <strong class="text-danger">
                    {{ formatPrice(item.product.price) }} đ
                  </strong>
                </div>

                <!-- Thông tin về số lượng đánh giá còn lại -->
                <div class="text-muted small mt-2">
                  <p class="mb-1">
                    Số lượt đánh giá còn lại:
                    <span class="text-primary fw-bold">{{
                      item.remainingReviews
                    }}</span>
                  </p>
                  <p class="mb-1">Tổng số lần mua: {{ item.totalPurchased }}</p>
                  <p class="mb-0">
                    Mua gần nhất: {{ formatDate(item.lastPurchaseDate) }}
                  </p>
                </div>

                <!-- Nút đánh giá -->
                <button
                  class="btn btn-primary mt-3 w-100"
                  @click="goToReview(item.product.slug)"
                >
                  <i class="fas fa-star me-2"></i>
                  Đánh giá ngay
                </button>
              </div>
            </div>
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
import { useRouter } from "vue-router";
import axios from "axios";
import { useToast } from "vue-toastification";

export default {
  setup() {
    const authStore = useAuthStore();
    const toast = useToast();
    const router = useRouter();
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
      });
    };

    const goToReview = (slug) => {
      router.push(`/product/${slug}#review`);
    };

    // Lấy danh sách sản phẩm chờ đánh giá
    const fetchPendingReviews = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/reviews/pending-reviews",
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );
        products.value = response.data.pendingProducts;
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm chờ đánh giá:", error);
        toast.error("Không thể tải danh sách sản phẩm chờ đánh giá");
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
      fetchPendingReviews();
    });

    return {
      products,
      currentPage,
      totalPages,
      paginatedProducts,
      changePage,
      formatPrice,
      formatDate,
      goToReview,
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

.card {
  transition: transform 0.2s;
  height: 100%;
}

.card:hover {
  transform: translateY(-5px);
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}
</style>
