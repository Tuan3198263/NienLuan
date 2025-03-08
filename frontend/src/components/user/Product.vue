<template>
  <div class="container py-2">
    <div class="row">
      <Breadcrumb :categories="categories" />

      <!-- Sidebar -->
      <div class="col-md-3">
        <h2 class="h4 mb-2 text-secondary">Danh mục</h2>

        <!-- Categories -->
        <ul class="list-unstyled">
          <li v-for="category in categories" :key="category._id" class="mb-2">
            <router-link
              :to="`/category/${category.slug}`"
              class="text-dark text-decoration-none hover-text-primary"
            >
              {{ category.name }}
            </router-link>
          </li>
        </ul>

        <!-- Search by Product Name -->
        <div class="mb-4 input-group">
          <span class="input-group-text" id="basic-addon1">
            <i class="fa fa-search"></i>
          </span>
          <input
            class="form-control"
            placeholder="Tìm theo tên sản phẩm"
            type="text"
            v-model="searchTerm"
          />
        </div>

        <!-- Brands Filter -->
        <h3 class="h5 mb-2 text-secondary">Thương hiệu</h3>
        <ul class="list-unstyled">
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
        <ul class="list-unstyled">
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
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import Breadcrumb from "./Breadcrumb.vue";

export default {
  components: {
    Breadcrumb,
  },
  props: {
    slug: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { slug } = props;

    const searchTerm = ref("");
    const currentPage = ref(1);
    const itemsPerPage = 6;

    const categories = ref([]);
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
      return new Intl.NumberFormat("vi-VN").format(price); // Định dạng theo kiểu tiền Việt Nam
    };

    // Hàm gọi API để lấy danh mục
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/categories/all-names"
        );
        categories.value = response.data;
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    // Hàm gọi API để lấy danh sách thương hiệu theo danh mục
    const fetchBrandsByCategory = async (categorySlug) => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/brands/brands-by-category/${categorySlug}`
        );
        // Bỏ trường count và chỉ lấy tên thương hiệu
        brands.value = response.data.map((brand) => ({
          ...brand,
          checked: false, // Thêm trường checked cho checkbox
        }));
      } catch (error) {
        console.error("Lỗi khi lấy thương hiệu:", error);
      }
    };

    // Hàm gọi API để lấy sản phẩm theo danh mục
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/products/list/category/slug/${props.slug}`
        );
        products.value = response.data.products;
        fetchBrandsByCategory(props.slug); // Lấy thương hiệu khi lấy sản phẩm
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    // Gọi API khi component được gắn vào DOM
    onMounted(() => {
      fetchCategories();
      fetchProducts();
    });

    // Thêm watch để theo dõi sự thay đổi slug từ route
    watch(() => props.slug, fetchProducts);
    const route = useRoute();
    watch(() => route.params.slug, fetchProducts);

    // Theo dõi sự thay đổi của thương hiệu (brands), phạm vi giá (priceRanges) và từ khóa tìm kiếm (searchTerm)
    watch([() => brands, () => priceRanges, searchTerm], () => {
      currentPage.value = 1; // Reset lại trang khi thay đổi bộ lọc
    });

    const filteredProducts = computed(() => {
      return products.value
        .filter((product) => {
          // Lọc theo tên sản phẩm
          if (searchTerm.value) {
            return product.name
              .toLowerCase()
              .includes(searchTerm.value.toLowerCase());
          }
          return true; // Nếu không có từ khóa tìm kiếm, cho phép tất cả
        })
        .filter((product) => {
          // Lọc theo thương hiệu
          if (brands.value.length > 0) {
            const selectedBrands = brands.value.filter(
              (brand) => brand.checked
            );
            if (selectedBrands.length > 0) {
              return selectedBrands.some(
                (brand) => brand.name === product.brand.name
              );
            }
          }
          return true; // Nếu không có thương hiệu nào được chọn, cho phép tất cả
        })
        .filter((product) => {
          const selectedPriceRanges = priceRanges.value.filter(
            (range) => range.checked
          );
          if (selectedPriceRanges.length > 0) {
            return selectedPriceRanges.some((range) => {
              let [minPrice, maxPrice] = range.label
                .split(" - ")
                .map((price) => {
                  if (price.includes("k")) {
                    return parseInt(price.replace("k", "000")); // 500k → 500000
                  } else if (price.includes("tr")) {
                    return parseInt(price.replace("tr", "000000")); // 1tr → 1000000
                  }
                  return parseInt(price); // Trường hợp khác (dự phòng)
                });
              return product.price >= minPrice && product.price <= maxPrice;
            });
          }
          return true;
        });
    });

    // Tính tổng số trang
    const totalPages = computed(() => {
      return Math.ceil(filteredProducts.value.length / itemsPerPage);
    });

    // Lấy danh sách sản phẩm của trang hiện tại
    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredProducts.value.slice(start, end);
    });

    // Chuyển trang trước
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    // Chuyển trang sau
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    return {
      slug,
      searchTerm,
      categories,
      brands,
      priceRanges,
      products,
      filteredProducts,
      paginatedProducts,
      currentPage,
      totalPages,
      prevPage,
      nextPage,
      formatPrice, // Trả về hàm formatPrice
    };
  },
};
</script>

<style scoped>
/* Thêm style tùy chỉnh nếu cần */
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
