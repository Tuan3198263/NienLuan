<template>
  <div class="container py-4 mt-3">
    <div class="row">
      <!-- Brand Column -->
      <div class="col-md-3">
        <div class="">
          <!-- Thêm ảnh thương hiệu -->
          <img
            v-if="brand.image"
            :src="brand.image"
            alt="Brand Image"
            class="brand-image mb-4"
            style="
              width: 100%;
              height: auto;
              object-fit: cover;
              border-radius: 8px;
            "
          />
          <p class="brand-description small" v-html="brand.description"></p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="col-md-9">
        <div class="row">
          <div v-if="products.length === 0" class="col-12 text-center mt-4">
            <i class="fas fa-box-open fa-5x mb-2" style="color: gray"></i>
            <p class="h5">Không tìm thấy sản phẩm tương ứng</p>
          </div>

          <div
            v-for="product in paginatedProducts"
            :key="product._id"
            class="col-md-4 mb-4"
          >
            <router-link
              :to="`/product/${product.slug}`"
              class="text-decoration-none"
            >
              <div class="card shadow-sm border-light rounded cursor-pointer">
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
                      <i
                        v-for="i in 5"
                        :key="i"
                        :class="{
                          'fas fa-star': i <= Math.floor(product.averageRating), // Sao đầy
                          'fas fa-star-half-alt':
                            i === Math.ceil(product.averageRating) &&
                            !Number.isInteger(product.averageRating), // Sao nửa
                          'far fa-star': i > product.averageRating, // Sao rỗng
                        }"
                      ></i>
                      <span class="text-secondary ms-1">
                        ({{
                          product.reviews.length > 0
                            ? product.reviews.length
                            : 0
                        }})
                      </span>
                    </div>
                  </div>
                  <strong class="text-danger font-weight-bold mt-1">
                    {{ formatPrice(product.price) }} đ
                  </strong>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Pagination -->
        <nav v-if="totalPages > 1">
          <ul class="pagination justify-content-center mt-4">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="prevPage">Trước</button>
            </li>
            <li
              v-for="page in totalPages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="currentPage = page">
                {{ page }}
              </button>
            </li>
            <li
              class="page-item"
              :class="{ disabled: currentPage === totalPages }"
            >
              <button class="page-link" @click="nextPage">Tiếp theo</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

// Đối số nhận từ props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

// Khai báo các biến trạng thái
const brand = ref({ name: "Đang tải...", description: "", image: "" });
const products = ref([]);
const currentPage = ref(1);
const perPage = 6;

// Fetch thông tin thương hiệu
const fetchBrandInfo = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/brands/${props.id}`);
    const brandData = res.data; // Giả sử API trả về đối tượng thương hiệu
    brand.value.description = brandData.description;
    brand.value.image = brandData.logo; // Đảm bảo lấy ảnh từ API
  } catch (error) {
    console.error("Lỗi khi lấy thông tin thương hiệu:", error);
  }
};

// Fetch các sản phẩm
const fetchProducts = async () => {
  try {
    const res = await axios.get(
      `http://localhost:3000/api/products/get-by-brand/${props.id}`
    );
    products.value = res.data.products;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
  }
};

// Tính toán danh sách sản phẩm theo trang
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return products.value.slice(start, start + perPage);
});

// Tính toán tổng số trang
const totalPages = computed(() => {
  return Math.ceil(products.value.length / perPage);
});

// Định dạng giá
const formatPrice = (price) => {
  return price.toLocaleString("vi-VN");
};

// Chuyển trang
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

// Chạy hàm khi component được mount
onMounted(() => {
  fetchBrandInfo(); // Lấy thông tin thương hiệu
  fetchProducts(); // Lấy sản phẩm của thương hiệu
});
</script>

<style scoped>
/* Thêm CSS nếu cần */
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
