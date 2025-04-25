<template>
  <div class="brand-management mb-4">
    <!-- Tiêu đề quản lý thương hiệu (in đậm) -->
    <h4 class="fw-bold">Quản lý Thương hiệu</h4>

    <!-- Tìm kiếm thương hiệu -->
    <div class="input-group mb-3 search-bar">
      <input
        type="text"
        v-model="searchQuery"
        @input="filterBrands"
        class="form-control"
        placeholder="Tìm kiếm thương hiệu..."
      />
      <span class="input-group-text">
        <i class="fas fa-search"></i>
      </span>
    </div>

    <!-- Nút thêm thương hiệu mới (căn phải) -->
    <div class="add-brand text-end">
      <button @click="showAddBrandModal" class="btn btn-sm btn-outline-success">
        <i class="fas fa-plus"></i> Thêm thương hiệu mới
      </button>
    </div>

    <!-- Số lượng hiển thị trên mỗi trang & Tổng số thương hiệu -->
    <div class="d-flex justify-content-between align-items-center my-3">
      <div>
        <span class="me-2">Hiển thị:</span>
        <select
          v-model="pageSize"
          class="form-select form-select-sm d-inline-block"
          style="width: auto"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="15">15</option>
          <option :value="20">20</option>
        </select>
        <span class="ms-2">thương hiệu mỗi trang</span>
      </div>
      <div>
        <span
          >Tổng số: <strong>{{ filteredBrands.length }}</strong> thương
          hiệu</span
        >
      </div>
    </div>

    <!-- Form Thêm Thương hiệu -->
    <div
      class="modal fade"
      id="addBrandModal"
      tabindex="-1"
      aria-labelledby="addBrandModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addBrandModalLabel">
              Thêm Thương Hiệu Mới
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitNewBrand">
              <div class="mb-3">
                <label for="brandName" class="form-label"
                  >Tên Thương Hiệu</label
                >
                <input
                  type="text"
                  v-model="newBrand.name"
                  class="form-control"
                  id="brandName"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="brandDescription" class="form-label">Mô Tả</label>
                <!-- Quill Editor -->
                <div ref="quillEditor" id="brandDescription"></div>
              </div>
              <div class="mb-3">
                <label for="brandLogo" class="form-label"
                  >Logo (Tải lên ảnh)</label
                >
                <input
                  type="file"
                  @change="handleFileChange"
                  class="form-control"
                  id="brandLogo"
                />
              </div>
              <div class="modal-footer">
                <button type="submit" class="btn btn-primary">Thêm</button>

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

    <!-- Form Chỉnh Sửa Thương Hiệu -->
    <div
      class="modal fade"
      id="editBrandModal"
      tabindex="-1"
      aria-labelledby="editBrandModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editBrandModalLabel">
              Chỉnh Sửa Thương Hiệu
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitEditBrand">
              <div class="mb-3">
                <label for="editBrandName" class="form-label"
                  >Tên Thương Hiệu</label
                >
                <input
                  type="text"
                  v-model="editBrand.name"
                  class="form-control"
                  id="editBrandName"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="editBrandDescription" class="form-label"
                  >Mô Tả</label
                >
                <div ref="editQuillEditor" id="editBrandDescription"></div>
              </div>
              <div class="mb-3">
                <label for="editBrandLogo" class="form-label"
                  >Logo (Tải lên ảnh)</label
                >
                <input
                  type="file"
                  @change="handleFileChangeForEdit"
                  class="form-control"
                  id="editBrandLogo"
                />
              </div>
              <div class="modal-footer">
                <button type="submit" class="btn btn-primary">
                  Lưu Thay Đổi
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

    <!-- Bảng danh sách thương hiệu -->
    <table class="brand-table table table-bordered">
      <thead>
        <tr>
          <th>#</th>
          <th>Tên Thương Hiệu</th>
          <th>Logo</th>
          <th>Mô Tả</th>
          <th>Ngày Tạo</th>
          <th>Ngày Cập Nhật</th>
          <th>Hành Động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(brand, index) in paginatedBrands" :key="brand._id">
          <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
          <!-- Sửa STT -->
          <td>{{ brand.name }}</td>
          <td style="text-align: center">
            <img :src="brand.logo" alt="Logo" class="brand-logo" />
          </td>
          <td>{{ brand.description }}</td>
          <td>{{ formatDate(brand.createdAt) }}</td>
          <td>{{ formatDate(brand.updatedAt) }}</td>
          <td class="text-center">
            <button
              class="btn btn-sm btn-outline-primary me-2"
              @click="viewBrand(brand)"
            >
              <i class="fas fa-eye"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-dark me-2"
              data-bs-toggle="modal"
              data-bs-target="#editBrandModal"
              @click="editBrandInfo(brand)"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              @click="deleteBrand(brand._id)"
            >
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Điều hướng phân trang -->
    <nav>
      <ul class="pagination">
        <!-- Nút "Trước" -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="previousPage">Trước</button>
        </li>

        <!-- Nút số trang -->
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

        <!-- Nút "Tiếp theo" -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="nextPage">Tiếp theo</button>
        </li>
      </ul>
    </nav>
  </div>
</template>
<script>
import { Modal } from "bootstrap"; // Import Modal từ Bootstrap (Lên trên cùng)
import { nextTick } from "vue";
import axios from "axios";
import { ref, computed, onMounted, watch } from "vue"; // Added watch
import { useToast } from "vue-toastification"; // Import useToast từ vue-toastification
import Swal from "sweetalert2";
import Quill from "quill"; // Import Quill
import "quill/dist/quill.snow.css"; // Import Quill CSS

export default {
  setup() {
    const brands = ref([]);
    const editBrand = ref({
      name: "",
      description: "",
      logo: "",
    });
    const searchQuery = ref("");
    const currentPage = ref(1);
    const pageSize = ref(10);
    const toast = useToast();

    let quillEditor = null;
    let editQuillEditor = null;

    // Watch pageSize changes to reset to page 1
    watch(pageSize, () => {
      currentPage.value = 1;
    });

    // Khởi tạo Quill editor
    const initQuill = () => {
      // Kiểm tra nếu Quill chưa được khởi tạo
      if (!quillEditor) {
        quillEditor = new Quill("#brandDescription", {
          theme: "snow",
          modules: {
            toolbar: [
              ["bold", "italic", "underline"],
              ["link", "image"],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
            ],
          },
        });

        quillEditor.on("text-change", () => {
          newBrand.value.description = quillEditor.root.innerHTML;
        });
      }
    };

    // Khởi tạo Quill cho form chỉnh sửa
    const initEditQuill = () => {
      if (!editQuillEditor) {
        editQuillEditor = new Quill("#editBrandDescription", {
          theme: "snow",
          modules: {
            toolbar: [
              ["bold", "italic", "underline"],
              ["link", "image"],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
            ],
          },
        });

        // Khi Quill thay đổi, cập nhật giá trị vào editBrand.description
        editQuillEditor.on("text-change", () => {
          editBrand.value.description = editQuillEditor.root.innerHTML;
        });
      }
    };

    // Đối tượng cho thương hiệu mới
    const newBrand = ref({
      name: "",
      description: "",
      logo: "",
    });

    // Xử lý khi người dùng chọn file ảnh
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        newBrand.value.logo = file; // Lưu file vào đối tượng newBrand
      }
    };

    // Lấy dữ liệu từ API
    const fetchBrands = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/brands");
        brands.value = response.data;
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    // Format ngày
    const formatDate = (dateString) => {
      const options = { year: "numeric", month: "long", day: "numeric" };
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", options);
    };

    // Bộ lọc tìm kiếm
    const filterBrands = () => {
      currentPage.value = 1;
    };

    // Các hành động khác
    const viewBrand = (brand) => {
      console.log("View Brand:", brand);
    };

    // Cập nhật thông tin thương hiệu để chỉnh sửa
    const editBrandInfo = (brand) => {
      editBrand.value = { ...brand }; // Sao chép dữ liệu thương hiệu vào biến editBrand

      initEditQuill();
    };

    const deleteBrand = async (brandId) => {
      try {
        // Sử dụng SweetAlert2 trực tiếp
        const result = await Swal.fire({
          title: "Bạn có chắc chắn muốn xóa thương hiệu này?",
          text: "Hành động này sẽ không thể hoàn tác!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
        });

        if (!result.isConfirmed) {
          return; // Người dùng nhấn "Hủy", dừng hành động
        }

        // Gửi yêu cầu DELETE tới API
        const response = await axios.delete(
          `http://localhost:3000/api/brands/${brandId}`
        );

        // Hiển thị thông báo thành công
        toast.success("Thương hiệu đã được xóa thành công.");

        // Làm mới lại danh sách thương hiệu
        fetchBrands();
      } catch (error) {
        // Kiểm tra lỗi từ phản hồi của server
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          // Nếu có thông báo lỗi từ server, hiển thị thông báo đó
          toast.error(error.response.data.message);
        } else {
          // Nếu không có thông báo lỗi từ server, hiển thị thông báo mặc định
          toast.error("Có lỗi xảy ra khi xóa thương hiệu.");
        }
      }
    };

    // Hiển thị modal thêm thương hiệu

    const showAddBrandModal = () => {
      nextTick(() => {
        const addBrandModal = new Modal(
          document.getElementById("addBrandModal")
        );
        addBrandModal.show();
        // Khởi tạo Quill sau khi modal được mở
        initQuill();
      });
    };

    // Gửi dữ liệu thương hiệu mới, bao gồm cả logo (file ảnh)
    const submitNewBrand = async () => {
      const formData = new FormData();
      formData.append("name", newBrand.value.name);
      formData.append("description", newBrand.value.description);
      formData.append("logo", newBrand.value.logo); // Thêm tệp logo vào FormData

      try {
        const response = await axios.post(
          "http://localhost:3000/api/brands",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data", // Cần thiết khi gửi FormData
            },
          }
        );

        // Thông báo thành công
        toast.success("Thêm thương hiệu thành công!");

        // Sau khi thêm thành công, làm mới lại danh sách thương hiệu
        fetchBrands();

        // Reset lại thông tin thương hiệu mới
        newBrand.value = {
          name: "",
          description: "",
          logo: "",
        };
        // Cập nhật lại Quill editor để mô tả bị xóa khỏi Quill
        if (quillEditor) {
          quillEditor.root.innerHTML = ""; // Xóa nội dung trong Quill
        }
      } catch (error) {
        console.error("Lỗi khi thêm thương hiệu:", error);

        // Log chi tiết lỗi từ server
        if (error.response && error.response.data) {
          toast.error(`Lỗi: ${error.response.data.message}`);
        } else {
          toast.error("Có lỗi xảy ra khi thêm thương hiệu.");
        }
      }
    };

    const submitEditBrand = async () => {
      const formData = new FormData();
      formData.append("name", editBrand.value.name);
      formData.append("description", editBrand.value.description);
      formData.append("logo", editBrand.value.logo); // Nếu có thay đổi logo

      try {
        // Gửi yêu cầu PUT tới API với ID thương hiệu
        const response = await axios.put(
          `http://localhost:3000/api/brands/${editBrand.value._id}`, // Đảm bảo dùng đúng ID của thương hiệu
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data", // Cần thiết khi gửi FormData
            },
          }
        );

        // Nếu thành công, hiển thị thông báo và cập nhật lại danh sách thương hiệu
        toast.success("Cập nhật thương hiệu thành công!");
        fetchBrands(); // Làm mới lại danh sách thương hiệu sau khi cập nhật

        // Reset form values
        editBrand.value = {
          name: "",
          description: "",
          logo: "",
        };

        // Reset Quill Editor
        if (editQuillEditor) {
          editQuillEditor.root.innerHTML = ""; // Xóa nội dung Quill
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật thương hiệu:", error);

        // Kiểm tra nếu có lỗi phản hồi từ server
        if (error.response) {
          // Trường hợp có lỗi trả về từ server (ví dụ: mã lỗi 400, 500)
          if (error.response.data && error.response.data.message) {
            toast.error(`Lỗi: ${error.response.data.message}`);
          } else {
            toast.error("Có lỗi xảy ra khi cập nhật thương hiệu.");
          }
        } else if (error.request) {
          // Trường hợp không nhận được phản hồi từ server (ví dụ: mất kết nối)
          toast.error("Không thể kết nối tới server.");
        } else {
          // Nếu có lỗi khác xảy ra
          toast.error("Có lỗi xảy ra khi xử lý yêu cầu.");
        }
      }
    };

    const filteredBrands = computed(() => {
      return brands.value.filter((brand) =>
        brand.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const paginatedBrands = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize.value;
      const endIndex = startIndex + pageSize.value;
      return filteredBrands.value.slice(startIndex, endIndex);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredBrands.value.length / pageSize.value);
    });

    // Thêm hàm changePage để cập nhật trang
    const changePage = (page) => {
      currentPage.value = page;
    };

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    onMounted(() => {
      fetchBrands();
      initQuill(); // Khởi tạo Quill editor sau khi component được mount
    });

    return {
      handleFileChange,
      brands,
      editBrand,
      editBrandInfo,
      searchQuery,
      currentPage,
      pageSize,
      paginatedBrands,
      filteredBrands, // Make sure filteredBrands is returned
      totalPages,
      changePage, // Đảm bảo trả về hàm changePage
      formatDate,
      viewBrand,
      editBrand,
      deleteBrand,
      filterBrands,
      showAddBrandModal,
      submitNewBrand,
      submitEditBrand,
      newBrand,
      previousPage,
      nextPage,
    };
  },
};
</script>

<style scoped>
.brand-management {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
  background-color: #f8f9fa;
  border-color: #ced4da;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

/* Thanh tìm kiếm ngắn lại */
.search-bar .form-control {
  width: 250px; /* Giảm chiều rộng thanh tìm kiếm */
  padding: 8px 12px;
}

.search-bar .input-group-text {
  background-color: transparent;
  border: 1px solid #ccc;
}

.add-brand button {
  padding: 10px 15px;
  margin-bottom: 20px;
}

.brand-table {
  width: 100%;
  border-collapse: collapse;
}

.brand-table th,
.brand-table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
  white-space: nowrap; /* Ngăn văn bản xuống dòng */
  overflow: hidden; /* Ẩn văn bản vượt quá ô */
  text-overflow: ellipsis; /* Hiển thị dấu "..." khi văn bản bị cắt ngắn */
  max-width: 200px;
}

.brand-table th {
  background-color: #f8f9fa;
}

.brand-table td {
  background-color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-logo {
  width: 100px;
  height: 100px;
  object-fit: cover;
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
