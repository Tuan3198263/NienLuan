<template>
  <div class="container mt-5">
    <!-- Tiêu đề -->
    <div class="d-flex justify-content-between align-items-center mb-4 mt-5">
      <h4 class="text-start fw-bold">Thêm sản phẩm mới</h4>
      <button class="btn btn-secondary" @click="goToProductList">
        <i class="fas fa-list"></i> Danh sách sản phẩm
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit">
      <!-- Tên sản phẩm -->
      <div class="mb-3">
        <label for="name" class="form-label">
          <i class="fas fa-box-open"></i> Tên sản phẩm
        </label>
        <input
          type="text"
          id="name"
          class="form-control"
          v-model="product.name"
          placeholder="Nhập tên sản phẩm"
          required
        />
      </div>

      <!-- Giá sản phẩm -->
      <div class="mb-3">
        <label for="price" class="form-label">
          <i class="fas fa-tag"></i> Giá sản phẩm
        </label>
        <input
          type="number"
          id="price"
          class="form-control"
          v-model="product.price"
          placeholder="Nhập giá sản phẩm"
          required
        />
      </div>

      <!-- Thương hiệu -->
      <div class="mb-3">
        <label for="brand" class="form-label">
          <i class="fas fa-trademark"></i> Thương hiệu
        </label>
        <v-select
          v-model="product.brand"
          :options="brands"
          label="name"
          value-key="id"
          placeholder="Chọn thương hiệu"
        ></v-select>
      </div>

      <!-- Danh mục -->
      <div class="mb-3">
        <label for="category" class="form-label">
          <i class="fas fa-th-list"></i> Danh mục
        </label>
        <v-select
          v-model="product.category"
          :options="categories"
          label="name"
          value-key="id"
          placeholder="Chọn danh mục"
        ></v-select>
      </div>

      <!-- Hình ảnh -->
      <div class="mb-3">
        <label for="images" class="form-label">
          <i class="fas fa-images"></i> Hình ảnh
        </label>
        <input
          type="file"
          id="images"
          class="form-control"
          multiple
          @change="handleFileChange"
          accept="image/*"
          required
        />
        <small v-if="imageError" class="text-danger">{{ imageError }}</small>
      </div>

      <!-- Mô tả -->
      <div class="mb-3">
        <label for="description" class="form-label">
          <i class="fas fa-align-left"></i> Mô tả
        </label>
        <div ref="descriptionEditor" required></div>
      </div>

      <!-- Thành phần (ingredients) -->
      <div class="mb-3">
        <label for="ingredients" class="form-label">
          <i class="fas fa-flask"></i> Thành phần
        </label>
        <div ref="ingredientsEditor" required></div>
      </div>

      <!-- Cách sử dụng (usage) -->
      <div class="mb-3">
        <label for="usage" class="form-label">
          <i class="fas fa-book"></i> Cách sử dụng
        </label>
        <div ref="usageEditor" required></div>
      </div>

      <!-- Tồn kho (stock) -->
      <div class="mb-3">
        <label for="stock" class="form-label">
          <i class="fas fa-cogs"></i> Tồn kho
        </label>
        <input
          type="number"
          id="stock"
          class="form-control"
          v-model="product.stock"
          placeholder="Nhập số lượng tồn kho"
          required
        />
      </div>

      <!-- Nút submit -->
      <button
        type="submit"
        class="btn btn-primary w-100"
        :disabled="isSubmitting"
      >
        <i class="fas fa-check"></i> Thêm sản phẩm
      </button>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2"; // Import SweetAlert2
import axios from "axios"; // Import axios
import Quill from "quill"; // Import Quill

import "vue-select/dist/vue-select.css";

export default {
  name: "AddProductForm",
  setup() {
    const router = useRouter();
    const product = ref({
      name: "",
      price: null,
      brand: "",
      category: "",
      description: "",
      ingredients: "",
      usage: "",
      stock: null,
      images: [],
    });

    const categories = ref([]);
    const brands = ref([]);
    const imageError = ref(""); // Biến lưu thông báo lỗi chọn hình ảnh

    const descriptionEditor = ref(null);
    const ingredientsEditor = ref(null);
    const usageEditor = ref(null);
    const isSubmitting = ref();

    const createQuillEditor = (ref, placeholder) => {
      return new Quill(ref.value, {
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
    };

    onMounted(async () => {
      // Gọi API lấy dữ liệu
      try {
        const categoriesResponse = await axios.get(
          "http://localhost:3000/api/categories/all-names"
        );
        categories.value = categoriesResponse.data;

        const brandsResponse = await axios.get(
          "http://localhost:3000/api/brands/all-names"
        );
        brands.value = brandsResponse.data;
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }

      // Khởi tạo Quill Editors
      createQuillEditor(descriptionEditor, "Nhập mô tả sản phẩm");
      createQuillEditor(ingredientsEditor, "Nhập thành phần sản phẩm");
      createQuillEditor(usageEditor, "Nhập hướng dẫn sử dụng");
    });

    const handleFileChange = (event) => {
      const files = event.target.files;
      console.log("Các tệp hình ảnh đã chọn:", files);

      // Kiểm tra số lượng tệp chọn
      if (files.length > 5) {
        imageError.value = "Bạn chỉ được chọn tối đa 5 hình ảnh.";
        return;
      }

      // Reset lỗi nếu người dùng chọn lại hình ảnh
      imageError.value = "";

      // Cập nhật danh sách hình ảnh vào product.images
      product.value.images = Array.from(files);
      console.log("Danh sách hình ảnh trong product:", product.value.images);
    };

    //submit form
    const handleSubmit = async () => {
      // Lấy nội dung HTML của các editor Quill
      product.value.description = descriptionEditor.value.firstChild.innerHTML;
      product.value.ingredients = ingredientsEditor.value.firstChild.innerHTML;
      product.value.usage = usageEditor.value.firstChild.innerHTML;
      console.log("Dữ liệu sản phẩm trước khi gửi:", product.value);

      // Vô hiệu hóa nút submit để tránh click nhiều lần
      isSubmitting.value = true;

      // Sử dụng SweetAlert2 để xác nhận người dùng trước khi gửi
      const result = await Swal.fire({
        title: "Bạn có chắc chắn muốn thêm sản phẩm?",
        text: "Thông tin sản phẩm sẽ được lưu!",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Có",
        cancelButtonText: "Hủy",
      });

      // Nếu người dùng chọn "Có"
      if (result.isConfirmed) {
        // Hiển thị thông báo "Vui lòng chờ..."
        const loadingSwal = Swal.fire({
          title: "Vui lòng chờ...",
          text: "Đang xử lý dữ liệu sản phẩm!",
          icon: "info",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading(); // Hiển thị loading spinner
          },
        });

        // Tạo một FormData để gửi dữ liệu
        const formData = new FormData();

        // Thêm các trường dữ liệu vào FormData
        formData.append("name", product.value.name);
        formData.append("price", product.value.price);
        formData.append("brand", product.value.brand._id);
        formData.append("category", product.value.category._id);
        formData.append("description", product.value.description);
        formData.append("ingredients", product.value.ingredients);
        formData.append("usage", product.value.usage);
        formData.append("stock", product.value.stock);

        // Thêm hình ảnh vào FormData
        product.value.images.forEach((image) => {
          formData.append("images", image);
        });

        try {
          // Gửi dữ liệu đến API để thêm sản phẩm
          const response = await axios.post(
            "http://localhost:3000/api/products",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log("Sản phẩm đã được thêm thành công:", response.data);
          // Xử lý sau khi gửi thành công
          loadingSwal.close(); // Đóng thông báo "Vui lòng chờ"
          Swal.fire("Thành công!", "Sản phẩm đã được tạo!", "success");

          // Xóa tất cả các trường sau khi thêm thành công
          product.value.name = "";
          product.value.price = "";
          product.value.brand = "";
          product.value.category = "";
          product.value.description = "";
          product.value.ingredients = "";
          product.value.usage = "";
          product.value.stock = "";
          product.value.images = [];

          // Reset Quill Editors nếu cần
          descriptionEditor.value.firstChild.innerHTML = "";
          ingredientsEditor.value.firstChild.innerHTML = "";
          usageEditor.value.firstChild.innerHTML = "";
        } catch (error) {
          // Lỗi khi thêm sản phẩm
          console.error("Lỗi khi thêm sản phẩm:", error);
          loadingSwal.close(); // Đóng thông báo "Vui lòng chờ"
          Swal.fire(
            "Lỗi",
            error.response
              ? error.response.data.message
              : "Có lỗi xảy ra khi thêm sản phẩm!",
            "error"
          );
        }
      } else {
        // Người dùng đã chọn hủy bỏ
        Swal.fire("Đã hủy", "Bạn đã hủy thao tác thêm sản phẩm.", "info");
      }

      // Bật lại nút submit sau khi hoàn thành
      isSubmitting.value = false;
    };

    const goToProductList = () => {
      router.push("/admin/products/list");
    };

    return {
      product,
      categories,
      brands, // Thêm brands vào return
      handleFileChange,
      handleSubmit,
      descriptionEditor,
      ingredientsEditor,
      usageEditor,
      imageError, // Trả về thông báo lỗi
      isSubmitting,
      createQuillEditor,
      goToProductList,
    };
  },
};
</script>

<style scoped>
/* Thêm style nếu cần */
</style>
