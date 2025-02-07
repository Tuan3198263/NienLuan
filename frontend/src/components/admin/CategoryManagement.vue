<template>
  <!-- Nội dung chính -->
  <div class="">
    <div class="d-flex justify-content-between align-items-center mb-4 mt-5">
      <h4>Danh Mục Sản Phẩm</h4>
      <button
        class="btn btn-primary mb-3"
        data-bs-toggle="modal"
        data-bs-target="#addCategoryModal"
      >
        Thêm danh mục
      </button>
    </div>

    <!-- Add Category Modal -->
    <div
      class="modal fade"
      id="addCategoryModal"
      tabindex="-1"
      aria-labelledby="addCategoryModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addCategoryModalLabel">
              Thêm danh mục
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addCategory">
              <div class="mb-3">
                <label for="categoryName" class="form-label"
                  >Tên danh mục</label
                >
                <input
                  type="text"
                  id="categoryName"
                  v-model="newCategory.name"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="categoryDescription" class="form-label"
                  >Miêu tả</label
                >
                <textarea
                  id="categoryDescription"
                  v-model="newCategory.description"
                  class="form-control"
                  required
                ></textarea>
              </div>
              <div class="mb-3">
                <label for="parentCategory" class="form-label"
                  >Danh mục cha</label
                >
                <input
                  type="text"
                  id="parentCategory"
                  v-model="newCategory.parentCategory"
                  class="form-control"
                />
              </div>

              <!-- Thay đổi thành select cho trạng thái -->
              <div class="mb-3">
                <label for="categoryStatus" class="form-label"
                  >Trạng thái</label
                >
                <select
                  id="categoryStatus"
                  v-model="newCategory.status"
                  class="form-select"
                  required
                >
                  <option value="active">Hiển thị trên cửa hàng</option>
                  <option value="inactive">Không hiển thị trên cửa hàng</option>
                </select>
              </div>

              <div class="modal-footer">
                <button type="submit" class="btn btn-primary ml-auto">
                  Thêm
                </button>
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Bảng Danh Mục -->
    <div>
      <table class="table table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>
              Tên Danh Mục
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="searchCategoryName"
                placeholder="Tìm kiếm..."
              />
            </th>
            <th>
              Miêu tả
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="searchDescription"
                placeholder="Tìm kiếm..."
              />
            </th>
            <th>
              Danh Mục Cha
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="searchParentCategory"
                placeholder="Tìm kiếm..."
              />
            </th>
            <th>
              Trạng Thái
              <select
                class="form-control form-control-sm"
                v-model="searchStatus"
              >
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <!-- Kiểm tra nếu có dữ liệu -->
          <tr
            v-if="paginatedCategories.length > 0"
            v-for="(category, index) in paginatedCategories"
            :key="category._id"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ category.name }}</td>
            <td>{{ category.description }}</td>
            <td>{{ category.parentCategory || "Không có" }}</td>
            <td>
              <span class="status-toggle">
                <i
                  v-show="category.status === 'active'"
                  class="fas fa-toggle-on text-success"
                ></i>
                <i
                  v-show="category.status === 'inactive'"
                  class="fas fa-toggle-off text-danger"
                ></i>
              </span>
            </td>
            <td class="action-buttons text-center">
              <button
                class="btn btn-sm btn-outline-primary me-2"
                data-bs-toggle="modal"
                data-bs-target="#viewCategoryModal"
                @click="viewCategory(category)"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button
                class="btn btn-gray btn-outline-dark btn-sm me-2"
                data-bs-toggle="modal"
                data-bs-target="#editCategoryModal"
                @click="editCategory(category)"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                @click="deleteCategory(category._id)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <!-- Hiển thị thông báo khi không có dữ liệu -->
          <tr v-else>
            <td colspan="6" class="text-center text-muted">
              Không tìm thấy danh mục...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Category Modal -->
    <div
      class="modal fade"
      id="editCategoryModal"
      tabindex="-1"
      aria-labelledby="editCategoryModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editCategoryModalLabel">
              Chỉnh sửa danh mục
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateCategory">
              <div class="mb-3">
                <label for="editCategoryName" class="form-label"
                  >Tên danh mục</label
                >
                <input
                  type="text"
                  id="editCategoryName"
                  v-model="selectedCategory.name"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="editCategoryDescription" class="form-label"
                  >Miêu tả</label
                >
                <textarea
                  id="editCategoryDescription"
                  v-model="selectedCategory.description"
                  class="form-control"
                  required
                ></textarea>
              </div>
              <div class="mb-3">
                <label for="editParentCategory" class="form-label"
                  >Danh mục cha</label
                >
                <input
                  type="text"
                  id="editParentCategory"
                  v-model="selectedCategory.parentCategory"
                  class="form-control"
                />
              </div>

              <!-- Thay đổi thành select cho trạng thái -->
              <div class="mb-3">
                <label for="editCategoryStatus" class="form-label"
                  >Trạng thái</label
                >
                <select
                  id="editCategoryStatus"
                  v-model="selectedCategory.status"
                  class="form-select"
                  required
                >
                  <option value="active">Hiển thị trên cửa hàng</option>
                  <option value="inactive">Không hiển thị trên cửa hàng</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="submit"
              class="btn btn-success"
              @click="updateCategory"
              data-bs-dismiss="modal"
            >
              Lưu thay đổi
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Category Modal -->
    <div
      class="modal fade"
      id="viewCategoryModal"
      tabindex="-1"
      aria-labelledby="viewCategoryModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="viewCategoryModalLabel">
              Xem chi tiết danh mục
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form>
              <!-- Nhóm thông tin cơ bản -->
              <div class="mb-3">
                <label for="viewCategoryName" class="form-label"
                  >Tên danh mục</label
                >
                <input
                  type="text"
                  id="viewCategoryName"
                  v-model="selectedCategory.name"
                  class="form-control"
                  readonly
                />
              </div>
              <div class="mb-3">
                <label for="viewCategoryDescription" class="form-label"
                  >Miêu tả</label
                >
                <textarea
                  id="viewCategoryDescription"
                  v-model="selectedCategory.description"
                  class="form-control"
                  readonly
                ></textarea>
              </div>

              <!-- Nhóm thông tin liên quan đến danh mục cha -->
              <div class="mb-3">
                <label for="viewParentCategory" class="form-label"
                  >Danh mục cha</label
                >
                <input
                  type="text"
                  id="viewParentCategory"
                  v-model="selectedCategory.parentCategory"
                  class="form-control"
                  readonly
                />
              </div>

              <!-- Nhóm trạng thái (hiển thị như các trường khác) -->
              <div class="mb-3">
                <label for="viewCategoryStatus" class="form-label"
                  >Trạng thái</label
                >
                <!-- Trạng thái dưới dạng input nhưng chỉ đọc -->
                <input
                  type="text"
                  id="viewCategoryStatus"
                  v-model="selectedCategory.status"
                  class="form-control"
                  readonly
                />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Điều hướng phân trang -->
    <nav>
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="prevPage">Trước</button>
        </li>
        <li
          class="page-item"
          v-for="page in totalPages"
          :key="page"
          :class="{ active: currentPage === page }"
        >
          <button class="page-link" @click="changePage(page)">
            {{ page }}
          </button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="nextPage">Tiếp theo</button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useToast } from "vue-toastification"; // Import useToast từ vue-toastification
import Swal from "sweetalert2"; // Import SweetAlert2
import { Modal } from "bootstrap"; // Import Modal từ Bootstrap (Lên trên cùng)
export default {
  setup() {
    const newCategory = ref({});
    const categories = ref([]);
    const selectedCategory = ref({});
    const currentPage = ref(1);
    const itemsPerPage = ref(5);

    // Các giá trị tìm kiếm
    const searchCategoryName = ref("");
    const searchDescription = ref("");
    const searchParentCategory = ref("");
    const searchStatus = ref("");

    // Sử dụng useToast để gọi các thông báo
    const toast = useToast();

    // Lấy dữ liệu từ API
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/categories/"
        );
        categories.value = response.data; // Giả sử API trả về danh sách danh mục
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    const addCategory = async () => {
      // Kiểm tra xem các trường có hợp lệ không
      if (
        !newCategory.value.name ||
        !newCategory.value.description ||
        !newCategory.value.status
      ) {
        // Hiển thị thông báo yêu cầu nhập đầy đủ thông tin
        toast.error("Vui lòng nhập đầy đủ tất cả các trường!");
        return; // Dừng lại nếu có trường thiếu
      }

      try {
        // Gửi yêu cầu POST nếu tất cả trường hợp lệ
        const response = await axios.post(
          "http://localhost:3000/api/categories",
          newCategory.value
        );

        // Hiển thị thông báo thành công
        toast.success("Danh mục đã được thêm thành công!");

        // Reset form sau khi thêm thành công
        newCategory.value = {
          name: "",
          description: "",
          parentCategory: "",
          status: "active",
        };

        // Gọi lại API để lấy danh mục mới nhất
        await fetchCategories(); // Làm mới danh sách categories sau khi thêm danh mục
      } catch (error) {
        // Hiển thị thông báo lỗi
        toast.error("Có lỗi khi thêm danh mục!");
        console.error("Error adding category:", error);
      }
    };

    const updateCategory = async () => {
      try {
        // Cập nhật trạng thái của danh mục trên server
        const response = await axios.put(
          `http://localhost:3000/api/categories/${selectedCategory.value._id}`,
          selectedCategory.value // Truyền nguyên đối tượng selectedCategory
        );
        console.log("Cập nhật danh mục thành công:", response.data);

        // Thông báo thành công
        toast.success("Cập nhật danh mục thành công!");

        // Sau khi cập nhật thành công, cập nhật lại danh mục trong mảng categories
        const index = categories.value.findIndex(
          (category) => category._id === selectedCategory.value._id
        );
        if (index !== -1) {
          categories.value[index] = { ...selectedCategory.value }; // Cập nhật lại danh mục trong danh sách
        }
      } catch (error) {
        console.error("Có lỗi khi cập nhật danh mục:", error);
        // Thông báo lỗi nếu có sự cố
        toast.error("Có lỗi khi cập nhật danh mục!");
      }
    };

    const filteredCategories = computed(() => {
      return categories.value.filter((item) => {
        const itemStatus = item.status?.toLowerCase() || ""; // Đảm bảo item.status là chuỗi
        const statusFilter = searchStatus.value.toLowerCase(); // Tìm trạng thái đã chọn

        // Chỉ lọc theo trạng thái nếu searchStatus có giá trị
        return (
          (item.name?.toLowerCase() || "").includes(
            searchCategoryName.value.toLowerCase()
          ) &&
          (item.description?.toLowerCase() || "").includes(
            searchDescription.value.toLowerCase()
          ) &&
          (item.parentCategory?.toLowerCase() || "").includes(
            searchParentCategory.value.toLowerCase()
          ) &&
          (searchStatus.value === "" || itemStatus === statusFilter) // Kiểm tra chính xác trạng thái
        );
      });
    });

    const paginatedCategories = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage.value;
      return filteredCategories.value.slice(
        startIndex,
        startIndex + itemsPerPage.value
      );
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredCategories.value.length / itemsPerPage.value);
    });

    const editCategory = (category) => {
      selectedCategory.value = { ...category }; // Sao chép thông tin danh mục được chọn

      // Đảm bảo rằng trạng thái cũng được xử lý đúng
      selectedCategory.value.status =
        selectedCategory.value.status || "inactive"; // Nếu không có trạng thái, mặc định là "inactive"
    };
    const viewCategory = (category) => {
      selectedCategory.value = { ...category }; // Sao chép thông tin danh mục được chọn
    };

    // hàm xóa danh mục
    const deleteCategory = async (categoryId) => {
      // Sử dụng SweetAlert2 để xác nhận xóa
      const result = await Swal.fire({
        title: "Bạn có chắc chắn muốn xóa danh mục này?",
        text: "Việc xóa sẽ không thể hoàn tác!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        try {
          // Tiến hành xóa nếu người dùng xác nhận
          await axios.delete(
            `http://localhost:3000/api/categories/${categoryId}`
          );
          // Thông báo thành công
          toast.success("Danh mục đã được xóa!");
          // Cập nhật lại danh sách sau khi xóa
          fetchCategories();
        } catch (error) {
          console.error("Lỗi khi xóa danh mục:", error);
          toast.error("Xóa danh mục thất bại!");
        }
      }
    };

    const changePage = (page) => {
      currentPage.value = page;
    };

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

    // Gọi API khi component được mount
    onMounted(() => {
      fetchCategories();
    });

    return {
      newCategory,
      categories,
      selectedCategory,
      currentPage,
      itemsPerPage,
      filteredCategories,
      paginatedCategories,
      totalPages,
      addCategory,
      updateCategory,
      editCategory,
      viewCategory,
      updateCategory,
      deleteCategory,
      changePage,
      prevPage,
      nextPage,
      searchCategoryName,
      searchDescription,
      searchParentCategory,
      searchStatus,
      filteredCategories,
    };
  },
};
</script>

<style scoped>
/* Tổng thể trang */
body {
  font-family: Arial, sans-serif;
  background-color: #f8f9fa;
  margin: 0;
  padding: 0;
}

.table-bordered th,
.table-bordered td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.table th {
  background-color: #f8f9fa;
}

.table td {
  background-color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Hiển thị dấu "..." khi nội dung quá dài */
}

/* Icon trạng thái (Status Toggle) - căn giữa */
.status-toggle {
  cursor: pointer;
  font-size: 24px; /* Tăng kích thước icon trạng thái */
  text-align: center; /* Căn giữa */
  display: inline-block; /* Để icon không chiếm toàn bộ chiều rộng */
  vertical-align: middle; /* Căn giữa theo chiều dọc */
  width: 100%; /* Đảm bảo icon nằm trong không gian cột */
}

/* Nút thêm danh mục */
.btn-success {
  background-color: #28a745;
  color: white;
  border: none;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #0056b3;
}

/* Pagination */
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

/* Tìm kiếm */
.mb-3 input {
  border: 1px solid #ccc;
}

.mb-3 input:focus {
  border-color: #007bff;
}

.d-flex input {
  margin-top: 5px;
}

h4 {
  font-weight: bold;
}

h5.modal-title {
  color: #007bff;
}

/* Thêm hiệu ứng hover cho bảng */
.table tbody tr:hover {
  background-color: #f1f1f1;
}
/* Căn chỉnh và khoảng cách chung cho các modal */
.modal-content {
  padding: 20px;
}

/* Form inputs chung */
.modal-body .form-label {
  font-weight: bold;
  text-align: left; /* Căn trái nội dung của label */
  display: block; /* Đảm bảo label chiếm toàn bộ chiều rộng */
  margin-bottom: 5px; /* Tạo khoảng cách giữa label và input */
}

.modal-body .form-control {
  margin-bottom: 15px;
  border-radius: 5px;
  box-shadow: none;
}

/* Đảm bảo các textarea có chiều cao phù hợp */
.modal-body textarea.form-control {
  height: 120px;
}

/* Căn chỉnh nút thêm/sửa vào phía phải */
.modal-body .text-end {
  text-align: right;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px 20px;
}

.modal-footer .btn {
  margin-left: 10px;
  padding: 10px 20px;
}

/* Căn chỉnh trạng thái switch */
.form-switch {
  display: inline-block;
  margin-top: 10px;
}

/* Các input, select đọc chỉ cho modal xem chi tiết */
.modal-body input[readonly],
.modal-body textarea[readonly] {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #6c757d;
}

/* Cải thiện vẻ ngoài của các modal */
.modal-dialog {
  max-width: 600px;
  margin: 30px auto;
}

/* Thêm các hiệu ứng hover cho các button */
.btn:hover {
  opacity: 0.9;
}

/* Đảm bảo các button có độ rộng thích hợp */
button[type="submit"] {
  padding: 10px 20px;
}

/* Tùy chỉnh các input trong form nếu cần */
input.form-control,
select.form-select {
  border-radius: 5px;
  padding: 10px;
}

/* Tùy chỉnh cho label */
label.form-label {
  font-size: 16px;
}
</style>
