<template>
  <div class="bg-white p-4 rounded-lg shadow-md favorite-container">
    <h2 class="h4 font-weight-bold mb-4">Sản phẩm yêu thích</h2>
    <div class="row">
      <!-- Main Content (Sản phẩm yêu thích) -->
      <div class="col-12">
        <div class="row">
          <div
            v-if="paginatedProducts.length === 0"
            class="col-12 text-center py-5"
          >
            <div class="d-flex flex-column align-items-center">
              <i class="fas fa-box-open fa-5x mb-3 text-muted"></i>
              <p class="h5 text-muted">Không có sản phẩm yêu thích</p>
            </div>
          </div>

          <div
            v-for="product in paginatedProducts"
            :key="product._id"
            class="col-md-4 mb-4"
          >
            <!-- Chỉ bọc ảnh và tên sản phẩm vào router-link -->
            <router-link
              :to="`/product/${product.slug}`"
              class="text-decoration-none"
            >
              <div
                class="card shadow-sm border-light rounded cursor-pointer"
                style="cursor: pointer"
              >
                <img
                  :src="product.images[0]"
                  :alt="product.name"
                  class="card-img-top"
                  style="object-fit: cover"
                />
                <div class="card-body">
                  <h6
                    class="text-muted text-truncate"
                    :title="product.brand.name"
                  >
                    {{ product.brand.name }}
                  </h6>
                  <h5
                    class="card-title text-truncate"
                    style="font-size: 0.9rem"
                    :title="product.name"
                  >
                    {{ product.name }}
                  </h5>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div class="text-warning">
                      <i class="fas fa-star" v-for="n in 5" :key="n"></i>
                    </div>
                  </div>
                  <strong class="text-danger font-weight-bold mt-1">
                    {{ formatPrice(product.price) }} VNĐ
                  </strong>
                </div>
              </div>
            </router-link>

            <!-- Nút xóa khỏi yêu thích chiếm toàn bộ chiều rộng -->
            <div class="mt-1 mb-2">
              <button
                class="btn btn-secondary btn-sm mt-2 w-100 d-flex align-items-center justify-content-center gap-2"
                @click="removeFromFavorites(product._id)"
              >
                <i class="fas fa-heart-broken"></i> Bỏ yêu thích
              </button>
            </div>
          </div>
        </div>
        <!-- Pagination -->
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
import { useAuthStore } from "../../store/AuthStore"; // Import store Pinia
import axios from "axios";
import { useToast } from "vue-toastification"; // Import Toast

export default {
  setup() {
    const authStore = useAuthStore();
    const toast = useToast(); // Khởi tạo toast
    const products = ref([]);
    const currentPage = ref(1);
    const itemsPerPage = 6; // Thay đổi số sản phẩm trên mỗi trang thành 6

    const formatPrice = (price) => {
      return new Intl.NumberFormat("vi-VN").format(price); // Định dạng theo kiểu tiền Việt Nam
    };

    // Hàm gọi API để lấy danh sách sản phẩm yêu thích
    const fetchFavoriteProducts = async () => {
      const token = authStore.token; // Lấy token từ Pinia store
      try {
        const response = await axios.get(
          `http://localhost:3000/api/favorites/list`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Dùng token từ store
            },
          }
        );
        products.value = response.data; // Giả sử API trả về sản phẩm yêu thích
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm yêu thích:", error);
      }
    };

    // Hàm xóa sản phẩm khỏi yêu thích
    const removeFromFavorites = async (productId) => {
      const token = authStore.token; // Lấy token từ Pinia store
      try {
        await axios.post(
          `http://localhost:3000/api/favorites/toggle`,
          { productId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Đã bỏ thích sản phẩm"); // Hiển thị thông báo thành công
        // Sau khi xóa, tải lại danh sách sản phẩm yêu thích
        fetchFavoriteProducts();
      } catch (error) {
        console.error("Lỗi khi bỏ yêu thích sản phẩm:", error);
        toast.error("Lỗi khi bỏ yêu thích!"); // Hiển thị thông báo lỗi
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
      fetchFavoriteProducts();
    });

    return {
      products,
      currentPage,
      itemsPerPage,
      totalPages,
      paginatedProducts,
      changePage,
      formatPrice,
      removeFromFavorites,
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
.favorite-container {
  min-height: 400px;
  width: 100%;
}

/* Chỉ áp dụng min-width trên màn hình lớn (ví dụ từ 992px trở lên) */
@media (min-width: 992px) {
  .favorite-container {
    min-width: 830px;
  }
}

/* Style cho phân trang */
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
</style>
