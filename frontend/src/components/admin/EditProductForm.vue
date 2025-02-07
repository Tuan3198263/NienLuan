<template>
  <div
    class="modal fade"
    id="editProductModal"
    tabindex="-1"
    aria-labelledby="editProductModalLabel"
    aria-hidden="true"
    ref="modalRef"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="editProductModalLabel">
            Chỉnh sửa Sản phẩm
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            @click="closeModal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body" style="max-height: 500px; overflow-y: auto">
          <!-- Thêm thuộc tính max-height và overflow-y: auto -->
          <form @submit.prevent="handleSubmit" class="row g-3">
            <!-- Tên sản phẩm -->
            <div class="col-md-6">
              <label for="productName" class="form-label">Tên Sản Phẩm</label>
              <input
                v-model="product.name"
                type="text"
                class="form-control"
                id="productName"
                required
              />
            </div>

            <!-- Giá sản phẩm -->
            <div class="col-md-6">
              <label for="productPrice" class="form-label">Giá</label>
              <input
                v-model="product.price"
                type="number"
                class="form-control"
                id="productPrice"
                required
              />
            </div>

            <!-- Danh mục -->
            <div class="col-md-6">
              <label for="productCategory" class="form-label">Danh Mục</label>
              <v-select
                v-model="product.category"
                :options="categories"
                label="name"
                value-key="id"
              ></v-select>
            </div>

            <!-- Thương hiệu -->
            <div class="col-md-6">
              <label for="productBrand" class="form-label">Thương Hiệu</label>
              <v-select
                v-model="product.brand"
                :options="brands"
                label="name"
                value-key="id"
              ></v-select>
            </div>

            <!-- Tồn kho -->
            <div class="col-md-6">
              <label for="productStock" class="form-label">Tồn Kho</label>
              <input
                v-model="product.stock"
                type="number"
                class="form-control"
                id="productStock"
                required
              />
            </div>

            <!-- Hình ảnh -->
            <div class="col-md-6">
              <label for="productImages" class="form-label">Hình ảnh</label>
              <input
                ref="fileInput"
                type="file"
                class="form-control"
                id="productImages"
                multiple
                @change="handleFileChange"
                accept="image/*"
              />
            </div>

            <!-- Mô tả -->
            <div class="col-12 mb-4">
              <label for="productDescription" class="form-label">Mô tả</label>
              <div ref="descriptionEditor" required></div>
            </div>

            <!-- Thành phần -->
            <div class="col-12 mb-4 mt-4">
              <label for="productIngredients" class="form-label"
                >Thành phần</label
              >
              <div ref="ingredientsEditor" required></div>
            </div>

            <!-- Cách sử dụng -->
            <div class="col-12 mb-4 mt-4">
              <label for="productUsage" class="form-label">Cách sử dụng</label>
              <div ref="usageEditor" required></div>
            </div>

            <!-- Trạng thái hoạt động (active) -->
            <div class="col-12 mt-4">
              <label class="form-label d-block">Trạng thái</label>
              <button
                :class="['btn', product.active ? 'btn-success' : 'btn-danger']"
                disabled
              >
                <i
                  :class="
                    product.active
                      ? 'fas fa-check-circle'
                      : 'fas fa-times-circle'
                  "
                ></i>
                {{
                  product.active ? "Sản phẩm đang hoạt động" : "Sản phẩm tạm ẩn"
                }}
              </button>
            </div>

            <!-- Nút submit -->
            <div class="col-12">
              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="isSubmitting"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
import { Modal } from "bootstrap";
import Swal from "sweetalert2"; // Import SweetAlert2
import axios from "axios"; // Import axios
import Quill from "quill"; // Import Quill

export default {
  props: {
    product: Object, // Nhận sản phẩm cần chỉnh sửa từ component cha
    onProductUpdated: Function, // Nhận callback từ component cha
  },
  setup(props) {
    const modalRef = ref(null);
    const product = ref({ ...props.product });
    const categories = ref([]); // Danh sách danh mục
    const brands = ref([]); // Danh sách thương hiệu

    const fileInput = ref(null); // Tạo ref cho input file

    let modalInstance = null;
    const isSubmitting = ref(false); // Biến kiểm tra khi đang gửi dữ liệu

    // Quill Editors
    const descriptionEditor = ref(null);
    const ingredientsEditor = ref(null);
    const usageEditor = ref(null);

    const imageError = ref(""); // Khai báo ref cho biến imageError
    // Gọi API lấy danh sách danh mục và thương hiệu
    const fetchCategoriesAndBrands = async () => {
      try {
        const [categoriesResponse, brandsResponse] = await Promise.all([
          axios.get("http://localhost:3000/api/categories"), // Thay bằng URL API của bạn
          axios.get("http://localhost:3000/api/brands"), // Thay bằng URL API của bạn
        ]);

        categories.value = categoriesResponse.data; // Gán dữ liệu danh mục
        brands.value = brandsResponse.data; // Gán dữ liệu thương hiệu
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        Swal.fire(
          "Lỗi",
          "Không thể tải danh sách danh mục và thương hiệu!",
          "error"
        );
      }
    };

    const createQuillEditor = (ref, placeholder) => {
      // Tạo một Quill editor mới chỉ khi chưa tồn tại editor
      if (ref.value && !ref.value.__quill) {
        const editor = new Quill(ref.value, {
          theme: "snow",
          placeholder,
          modules: {
            toolbar: [
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link"],
            ],
          },
        });

        // Lắng nghe sự kiện khi nội dung thay đổi
        editor.on("text-change", () => {
          // Cập nhật dữ liệu khi nội dung thay đổi
          if (ref === descriptionEditor) {
            product.value.description = editor.root.innerHTML;
          } else if (ref === ingredientsEditor) {
            product.value.ingredients = editor.root.innerHTML;
          } else if (ref === usageEditor) {
            product.value.usage = editor.root.innerHTML;
          }
        });

        // Lưu editor vào đối tượng DOM
        ref.value.__quill = editor;
        return editor;
      }
      return ref.value.__quill;
    };

    onMounted(() => {
      if (modalRef.value) {
        modalInstance = new Modal(modalRef.value);
      }

      // Chỉ tạo editor khi chưa có
      descriptionEditor.value = createQuillEditor(
        descriptionEditor,
        "Nhập mô tả sản phẩm"
      );
      ingredientsEditor.value = createQuillEditor(
        ingredientsEditor,
        "Nhập thành phần sản phẩm"
      );
      usageEditor.value = createQuillEditor(
        usageEditor,
        "Nhập hướng dẫn sử dụng"
      );
      // Gọi API để lấy danh sách
      fetchCategoriesAndBrands();
    });

    onBeforeUnmount(() => {
      // Hủy Quill editor nhẹ nhàng, tránh lỗi
      if (descriptionEditor.value && descriptionEditor.value.__quill) {
        descriptionEditor.value.__quill.setText(""); // Xóa nội dung
        descriptionEditor.value.__quill = null; // Hủy đối tượng Quill
      }
      if (ingredientsEditor.value && ingredientsEditor.value.__quill) {
        ingredientsEditor.value.__quill.setText(""); // Xóa nội dung
        ingredientsEditor.value.__quill = null;
      }
      if (usageEditor.value && usageEditor.value.__quill) {
        usageEditor.value.__quill.setText(""); // Xóa nội dung
        usageEditor.value.__quill = null;
      }
    });

    watch(
      () => props.product,
      (newProduct) => {
        product.value = { ...newProduct };

        nextTick(() => {
          // Cập nhật nội dung chỉ nếu Quill editor đã được tạo
          if (descriptionEditor.value && descriptionEditor.value.__quill) {
            descriptionEditor.value.__quill.root.innerHTML =
              product.value.description || "";
          }

          if (ingredientsEditor.value && ingredientsEditor.value.__quill) {
            ingredientsEditor.value.__quill.root.innerHTML =
              product.value.ingredients || "";
          }

          if (usageEditor.value && usageEditor.value.__quill) {
            usageEditor.value.__quill.root.innerHTML =
              product.value.usage || "";
          }

          // Mở modal nếu chưa mở và có sản phẩm hợp lệ
          if (newProduct && newProduct._id && !modalInstance._isShown) {
            modalInstance.show();
          }
        });
      },
      { immediate: true }
    );

    // Xử lý khi người dùng chọn file
    const handleFileChange = (event) => {
      const files = event.target.files;
      console.log("Các tệp hình ảnh đã chọn:", files);

      // Kiểm tra số lượng tệp
      if (files.length > 5) {
        imageError.value = "Bạn chỉ được chọn tối đa 5 hình ảnh.";
        return;
      }

      imageError.value = ""; // Xóa lỗi nếu có
      product.value.images = Array.from(files); // Lưu danh sách ảnh
      console.log("Danh sách hình ảnh trong product:", product.value.images);
    };

    //submit form
    const handleSubmit = async () => {
      isSubmitting.value = true;

      // Xác nhận trước khi gửi
      const result = await Swal.fire({
        title: "Bạn có chắc chắn muốn cập nhật sản phẩm?",
        text: "Thông tin sản phẩm sẽ được lưu!",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Có",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        const loadingSwal = Swal.fire({
          title: "Vui lòng chờ...",
          text: "Đang xử lý dữ liệu sản phẩm!",
          icon: "info",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        try {
          // Chuẩn bị FormData
          const formData = new FormData();
          formData.append("name", product.value.name);
          formData.append("price", product.value.price);
          formData.append("stock", product.value.stock);
          formData.append("category", product.value.category._id);
          formData.append("brand", product.value.brand._id);

          // Thêm các trường từ Quill editors
          formData.append("description", product.value.description || "");
          formData.append("ingredients", product.value.ingredients || "");
          formData.append("usage", product.value.usage || "");

          // Thêm hình ảnh vào FormData
          product.value.images.forEach((image) => {
            formData.append("images", image);
          });

          // Gửi API PUT/PATCH với _id trong URL
          const response = await axios.put(
            `http://localhost:3000/api/products/${product.value._id}`, // Thay bằng URL API
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log("Cập nhật thành công:", response.data);
          loadingSwal.close(); // Đóng loading
          Swal.fire("Thành công!", "Sản phẩm đã được cập nhật!", "success");

          // Gọi hàm onProductUpdated để reload danh sách sản phẩm
          props.onProductUpdated();
        } catch (error) {
          console.error("Lỗi khi cập nhật sản phẩm:", error);
          loadingSwal.close();
          Swal.fire("Lỗi", "Có lỗi xảy ra khi cập nhật sản phẩm!", "error");
        }
      } else {
        Swal.fire("Đã hủy", "Bạn đã hủy thao tác cập nhật.", "info");
      }

      isSubmitting.value = false;
    };

    // Hàm reset giá trị input file
    const resetFileInput = () => {
      if (fileInput.value) {
        fileInput.value.value = ""; // Reset giá trị file input
      }
    };

    // Đóng modal khi nhấn nút đóng
    const closeModal = () => {
      if (modalInstance) {
        resetFileInput(); // Gọi hàm reset khi đóng modal
        modalInstance.hide(); // Đóng modal
      }
    };

    return {
      fileInput,
      modalRef,
      product,
      categories,
      brands,
      closeModal,
      isSubmitting,
      descriptionEditor,
      ingredientsEditor,
      usageEditor,
      handleFileChange,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
/* Style modal nếu cần */
/* Tùy chỉnh thêm border radius cho các input */
.form-control {
  border-radius: 10px;
}

/* Thêm margin dưới cho các trường dữ liệu */
.mb-3 {
  margin-bottom: 1.5rem;
}
/* Tùy chỉnh padding cho Quill editor */
.quill-editor {
  padding: 10px;
  border-radius: 8px;
  background-color: #f8f9fa;
}

/* Cải thiện khoảng cách dưới cho các Quill editor */
.col-12.mb-4 {
  margin-bottom: 4rem !important; /* Đảm bảo khoảng cách đủ lớn */
}
.btn-success {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn i {
  margin-right: 8px;
  font-size: 1.2rem;
}
</style>
