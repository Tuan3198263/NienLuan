<template>
  <div class="container py-2">
    <div class="row">
      <Breadcrumb :keyword="keyword" />
      <!-- Sidebar -->
      <div class="col-md-3">
        <!-- Brands Filter -->

        <h3 class="h5 mb-2 text-secondary">Thương hiệu</h3>
        <ul
          class="list-unstyled"
          style="
            max-height: 280px !important;
            overflow-y: auto !important;
            padding-right: 10px !important;
            padding-left: 5px !important;
            scrollbar-width: thin !important;
          "
        >
          <li v-for="brand in brands" :key="brand._id" class="mb-2">
            <div class="form-check">
              <input
                type="checkbox"
                class="form-check-input"
                :id="brand._id"
                v-model="brand.checked"
              />
              <label class="form-check-label" :for="brand._id">
                {{ brand.name }}
              </label>
            </div>
          </li>
        </ul>

        <!-- Price Filter -->
        <h3 class="h5 mb-2 text-secondary">Giá</h3>
        <ul class="list-unstyled" style="padding-left: 5px">
          <li
            v-for="priceRange in priceRanges"
            :key="priceRange.label"
            class="mb-2"
          >
            <div class="form-check">
              <input
                type="checkbox"
                class="form-check-input"
                :id="priceRange.label"
                v-model="priceRange.checked"
              />
              <label class="form-check-label" :for="priceRange.label">
                {{ priceRange.label }}
              </label>
            </div>
          </li>
        </ul>
      </div>

      <!-- Main Content -->
      <div class="col-md-9">
        <div class="row">
          <!-- Check if there are any filtered products -->
          <div
            v-if="filteredProducts.length === 0"
            class="col-12 text-center mt-4"
          >
            <i class="fas fa-box-open fa-5x mb-2" style="color: gray"></i>
            <p class="h5">Không tìm thấy sản phẩm tương ứng</p>
          </div>

          <div
            v-for="product in paginatedProducts"
            :key="product._id"
            class="col-md-4 mb-4"
          >
            <!-- Use router-link for navigation -->
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

        <!-- Pagination (only if there is more than 1 page) -->
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

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Breadcrumb from "./Breadcrumb.vue";

export default {
  components: { Breadcrumb },
  props: {
    keyword: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const keyword = ref(route.params.keyword); // Lấy keyword từ route

    const currentPage = ref(1);
    const itemsPerPage = 6;

    const brands = ref([]);
    const priceRanges = ref([
      { label: "0 - 100k", checked: false },
      { label: "100k - 500k", checked: false },
      { label: "500k - 1tr", checked: false },
      { label: "1tr - 2tr", checked: false },
    ]);

    const products = ref([]);

    // Hàm định dạng tiền
    const formatPrice = (price) => {
      return new Intl.NumberFormat("vi-VN").format(price);
    };

    // Hàm gọi API để tìm kiếm sản phẩm theo từ khóa
    const fetchProducts = async () => {
      try {
        console.log("Fetching products for:", keyword.value);
        const response = await axios.get(
          `http://localhost:3000/api/products/search?keyword=${keyword.value}`
        );
        products.value = response.data.products;
        fetchBrandsByKeyword(); // Lấy thương hiệu khi tìm kiếm sản phẩm
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    // Hàm gọi API để lấy danh sách thương hiệu theo từ khóa tìm kiếm
    const fetchBrandsByKeyword = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/brands/search?keyword=${keyword.value}`
        );
        brands.value = response.data.map((brand) => ({
          ...brand,
          checked: false, // Thêm trường checked cho checkbox
        }));
      } catch (error) {
        console.error("Lỗi khi lấy thương hiệu:", error);
      }
    };

    // Gọi API khi component được gắn vào DOM
    onMounted(() => {
      fetchProducts(); // Fetch products and brands on mount
    });
    // **Theo dõi sự thay đổi của route.params.keyword**
    watch(
      () => route.params.keyword,
      (newKeyword) => {
        keyword.value = newKeyword;
        currentPage.value = 1; // Reset số trang khi từ khóa thay đổi
        fetchProducts(); // Gọi lại API khi từ khóa thay đổi
      }
    );
    // Lọc sản phẩm theo các bộ lọc
    const filteredProducts = computed(() => {
      return products.value
        .filter((product) => {
          // Lọc theo thương hiệu
          const selectedBrands = brands.value.filter((brand) => brand.checked);
          if (selectedBrands.length > 0) {
            return selectedBrands.some(
              (brand) => brand.name === product.brand.name
            );
          }
          return true;
        })
        .filter((product) => {
          // Lọc theo phạm vi giá
          const selectedPriceRanges = priceRanges.value.filter(
            (range) => range.checked
          );
          if (selectedPriceRanges.length > 0) {
            return selectedPriceRanges.some((range) => {
              const [minPrice, maxPrice] = range.label
                .split(" - ")
                .map((price) => {
                  if (price.includes("k")) {
                    return parseInt(price.replace("k", "000")); // 500k → 500000
                  } else if (price.includes("tr")) {
                    return parseInt(price.replace("tr", "000000")); // 1tr → 1000000
                  }
                  return parseInt(price); // Trường hợp khác
                });
              return product.price >= minPrice && product.price <= maxPrice;
            });
          }
          return true;
        });
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredProducts.value.length / itemsPerPage);
    });

    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredProducts.value.slice(start, end);
    });

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    return {
      brands,
      priceRanges,
      products,
      filteredProducts,
      paginatedProducts,
      currentPage,
      totalPages,
      prevPage,
      nextPage,
      formatPrice,
    };
  },
};
</script>
<style scoped>
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
