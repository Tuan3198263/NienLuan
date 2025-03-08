<template>
  <div class="">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold">Quản Lý Sản Phẩm</h4>
      <button class="btn btn-primary" @click="goToAddProduct">
        Thêm sản phẩm
      </button>
    </div>

    <!-- Bộ lọc tìm kiếm -->
    <div class="card p-3 mb-4">
      <div class="row g-3">
        <div class="col-md-3">
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-search"></i></span>
            <input
              v-model="filters.name"
              type="text"
              class="form-control"
              placeholder="Tìm theo tên sản phẩm"
            />
          </div>
        </div>
        <div class="col-md-3">
          <div class="input-group">
            <span class="input-group-text"
              ><i class="fas fa-th-large"></i
            ></span>
            <input
              v-model="filters.category"
              type="text"
              class="form-control"
              placeholder="Danh mục"
            />
          </div>
        </div>
        <div class="col-md-3">
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-cogs"></i></span>
            <input
              v-model="filters.brand"
              type="text"
              class="form-control"
              placeholder="Thương hiệu"
            />
          </div>
        </div>
        <div class="col-md-3">
          <div class="input-group">
            <span class="input-group-text"
              ><i class="fas fa-toggle-on"></i
            ></span>
            <select v-model="filters.active" class="form-select">
              <option value="">Tất cả trạng thái</option>
              <option value="true">Kích hoạt</option>
              <option value="false">Tạm ẩn</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Bảng Sản Phẩm -->
    <table class="product-table table table-bordered">
      <thead>
        <tr>
          <th>#</th>
          <th>Tên Sản Phẩm</th>
          <th>Hình Ảnh</th>
          <th>Danh Mục</th>
          <th>Thương Hiệu</th>
          <th>Giá</th>
          <th>Tồn Kho</th>
          <th>Trạng Thái</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-if="paginatedProducts.length > 0"
          v-for="(product, index) in paginatedProducts"
          :key="product._id"
        >
          <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
          <td>{{ product.name }}</td>
          <td class="text-center">
            <img
              :src="
                product.images.length > 0
                  ? product.images[0]
                  : 'default-image-url.jpg'
              "
              alt="product image"
              style="width: 50px; height: 50px; object-fit: cover"
            />
          </td>
          <td>
            {{ product.category ? product.category.name : "Không có danh mục" }}
          </td>
          <td>
            {{ product.brand ? product.brand.name : "Không có thương hiệu" }}
          </td>
          <td>{{ formatCurrency(product.price) }}</td>
          <td class="text-center">{{ product.stock }}</td>
          <td class="text-center">
            <button
              :class="['btn', product.active ? 'btn-success' : 'btn-secondary']"
              style="min-width: 100px"
              @click="toggleActiveStatus(product)"
            >
              {{ product.active ? "Đang bán" : "Tạm ẩn" }}
            </button>
          </td>
          <td class="text-center">
            <button
              class="btn btn-sm btn-outline-primary me-2"
              @click="viewProduct(product)"
            >
              <i class="fas fa-eye"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-dark me-2"
              @click="editProduct(product)"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              @click="deleteProduct(product)"
            >
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
        <tr v-else>
          <td colspan="9" class="text-center text-muted">
            Không tìm thấy sản phẩm...
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Phân trang -->
    <!-- Phân trang -->
    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="changePage(currentPage - 1)">
            Trước
          </button>
        </li>
        <li
          class="page-item"
          v-for="page in totalPages"
          :key="page"
          :class="{ active: page === currentPage }"
        >
          <button class="page-link" @click="changePage(page)">
            {{ page }}
          </button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="changePage(currentPage + 1)">
            Tiếp theo
          </button>
        </li>
      </ul>
    </nav>

    <!-- Modal Edit Product -->
    <EditProductForm
      :product="selectedProduct"
      :onProductUpdated="onProductUpdated"
    />
  </div>
</template>
<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2"; // Nếu sử dụng npm
import axios from "axios";
import EditProductForm from "./EditProductForm.vue";
import { Modal } from "bootstrap";
export default {
  components: {
    EditProductForm, // Đăng ký component modal
  },
  setup() {
    const router = useRouter();
    const products = ref();
    const selectedProduct = ref(null);

    const filters = ref({
      name: "",
      category: "",
      brand: "",
      active: "",
    });

    const itemsPerPage = ref(5); // Số sản phẩm mỗi trang
    const currentPage = ref(1);

    // Hàm để lấy dữ liệu sản phẩm từ API
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/products");
        console.log(response.data); // Kiểm tra dữ liệu trả về
        products.value = response.data.products; // Giả sử dữ liệu trả về là mảng sản phẩm
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
      }
    };

    const filteredProducts = computed(() => {
      if (!Array.isArray(products.value)) return []; // Kiểm tra xem products.value có phải là mảng không
      return products.value.filter((product) => {
        const nameMatch = product.name
          .toLowerCase()
          .includes(filters.value.name.toLowerCase());

        // Kiểm tra đúng danh mục
        const categoryMatch =
          !filters.value.category ||
          (product.category &&
            product.category.name
              .toLowerCase()
              .includes(filters.value.category.toLowerCase()));

        // Kiểm tra đúng thương hiệu
        const brandMatch =
          !filters.value.brand ||
          (product.brand &&
            product.brand.name
              .toLowerCase()
              .includes(filters.value.brand.toLowerCase()));

        // Kiểm tra trạng thái kích hoạt
        const activeMatch =
          filters.value.active === "" ||
          product.active === (filters.value.active === "true");

        return nameMatch && categoryMatch && brandMatch && activeMatch;
      });
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredProducts.value.length / itemsPerPage.value);
    });

    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      return filteredProducts.value.slice(start, start + itemsPerPage.value);
    });

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    };

    const toggleActiveStatus = async (product) => {
      try {
        // Hiển thị hộp thoại xác nhận trước khi thay đổi trạng thái
        const result = await Swal.fire({
          title: "Bạn chắc chắn muốn thay đổi trạng thái?",
          text: product.active
            ? "Thao tác này sẽ khiến sản phẩm tạm ẩn trên cửa hàng."
            : "Thao tác này sẽ khiến sản phẩm hiển thị trên cửa hàng.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Chắc chắn",
          cancelButtonText: "Hủy",
        });

        // Nếu người dùng nhấn "Chắc chắn"
        if (result.isConfirmed) {
          // Gửi yêu cầu PATCH để cập nhật trạng thái active của sản phẩm
          const response = await axios.patch(
            `http://localhost:3000/api/products/${product._id}/active`,
            { active: !product.active }
          );

          // Cập nhật lại trạng thái của sản phẩm sau khi cập nhật thành công
          product.active = response.data.product.active;

          // Hiển thị thông báo thành công
          Swal.fire("Thành công!", response.data.message, "success");
        } else {
          // Nếu người dùng hủy, hiển thị thông báo hủy bỏ
          Swal.fire("Hủy bỏ", "Trạng thái sản phẩm không thay đổi.", "info");
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái sản phẩm:", error);
        Swal.fire("Lỗi", "Có lỗi xảy ra, vui lòng thử lại.", "error");
      }
    };
    //view
    const viewProduct = (product) => {
      const productUrl = `/product/${product.slug}`; // Tạo URL từ slug sản phẩm
      window.open(productUrl, "_blank"); // Mở URL trong tab mới
    };

    //edit
    const editProduct = (product) => {
      selectedProduct.value = { ...product }; // Copy the product into selectedProduct for editing
      // Get the modal element
      const editModalElement = document.getElementById("editProductModal");

      // Initialize and show the modal
      const editModal = new Modal(editModalElement);
      editModal.show();
    };

    // Hàm xóa sản phẩm
    const deleteProduct = async (product) => {
      try {
        // Hiển thị hộp thoại xác nhận trước khi xóa sản phẩm
        const result = await Swal.fire({
          title: "Bạn chắc chắn muốn xóa sản phẩm này?",
          text: "Hành động này không thể hoàn tác.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
        });

        // Nếu người dùng nhấn "Chắc chắn"
        if (result.isConfirmed) {
          // Gửi yêu cầu DELETE để xóa sản phẩm
          const response = await axios.delete(
            `http://localhost:3000/api/products/${product._id}`
          );

          // Hiển thị thông báo thành công
          Swal.fire("Thành công!", response.data.message, "success");

          // Cập nhật lại danh sách sản phẩm
          products.value = products.value.filter((p) => p._id !== product._id);
        } else {
          // Nếu người dùng hủy, hiển thị thông báo hủy bỏ
          Swal.fire("Hủy bỏ", "Sản phẩm không bị xóa.", "info");
        }
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        Swal.fire("Lỗi", "Có lỗi xảy ra, vui lòng thử lại.", "error");
      }
    };

    // Hàm để xử lý sự kiện cập nhật thành công từ component con
    const onProductUpdated = () => {
      fetchProducts(); // Fetch lại sản phẩm sau khi cập nhật thành công
    };

    const goToAddProduct = () => {
      router.push("/admin/products/add");
    };
    // Gọi hàm fetchProducts khi component được mount
    onMounted(() => {
      fetchProducts();
    });
    return {
      products,
      selectedProduct,
      editProduct,
      deleteProduct,
      filters,
      filteredProducts,
      formatCurrency,
      toggleActiveStatus,
      viewProduct,
      itemsPerPage,
      currentPage,
      totalPages,
      changePage,
      paginatedProducts,
      onProductUpdated, // Trả về hàm cho component con gọi
      goToAddProduct,
    };
  },
};
</script>
<style scoped>
.product-table th {
  background-color: #f8f9fa;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

.card {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

.product-table th,
.product-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

/* Điều chỉnh chiều rộng cột Tồn Kho */
.product-table td:nth-child(7),
.product-table th:nth-child(7) {
  width: 100px; /* Điều chỉnh kích thước cột theo yêu cầu */
}

.product-table td:nth-child(1),
.product-table th:nth-child(1) {
  width: 15px; /* Điều chỉnh kích thước cột theo yêu cầu */
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
</style>
