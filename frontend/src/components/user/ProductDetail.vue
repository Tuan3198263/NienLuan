<template>
  <div class="container py-5">
    <div class="row g-4">
      <!-- Left Section: Image Gallery -->
      <div class="col-12 col-md-6 d-flex flex-column align-items-center">
        <div class="border rounded p-2 mb-3 shadow-sm">
          <!-- Ảnh chính -->
          <img
            :alt="mainImage.alt"
            :src="mainImage.src"
            class="img-fluid rounded"
            style="object-fit: cover; width: 400px; height: 400px"
          />
        </div>
        <div class="d-flex flex-wrap justify-content-center gap-2">
          <img
            v-for="(image, index) in galleryImages"
            :key="index"
            :alt="'Image ' + (index + 1)"
            :src="image"
            class="img-thumbnail shadow-sm"
            style="
              width: 100px;
              height: 100px;
              object-fit: cover;
              cursor: pointer;
            "
            @mouseover="hoverImage(image)"
            @mouseleave="resumeAutoSlide"
            @click="selectMainImage(image)"
            :class="{ 'border-primary border-3': image === mainImage.src }"
          />
        </div>
        <p class="text-muted mt-2">
          {{ currentIndex + 1 }} / {{ galleryImages.length }}
        </p>
      </div>

      <!-- Right Section: Product Details -->
      <div class="col-12 col-md-6">
        <Breadcrumb />
        <h4 class="text-secondary mb-3">{{ product.brand.name }}</h4>
        <h1 class="h4 fw-bold mb-4">{{ product.name }}</h1>

        <!-- Ratings and Reviews -->
        <div class="d-flex align-items-center mb-3">
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
          </div>

          <span class="text-muted ms-2">
            {{
              product.reviews.length > 0
                ? product.reviews.length + " đánh giá"
                : "Chưa có đánh giá"
            }}
          </span>
          <span class="mx-2">|</span>
          <span class="text-muted">
            <i class="fas fa-heart text-danger"></i> {{ favoriteCount }} lượt
            thích
          </span>
        </div>

        <!-- Price -->
        <p class="h4 text-danger fw-bold mb-4">
          {{ formatPrice(product.price) }}
        </p>

        <!-- Shipping and Return Policy -->
        <div class="border rounded p-3 mb-4 bg-light shadow-sm">
          <div class="d-flex align-items-center mb-2">
            <i class="fas fa-shipping-fast text-success me-2"></i>
            <span>Miễn phí giao hàng tối đa 15k</span>
          </div>
          <div class="d-flex align-items-center">
            <i class="fas fa-sync-alt text-info me-2"></i>
            <span>Đổi trả hàng trong 7 ngày</span>
          </div>
        </div>

        <!-- Buttons -->
        <div class="d-flex gap-3">
          <button
            class="btn btn-success text-white px-4 py-2 rounded shadow-sm d-flex align-items-center gap-2"
            @click="addToCart"
          >
            <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
          </button>
          <button
            :class="isFavorite ? 'btn-danger' : 'btn-outline-secondary'"
            @click="toggleFavorite"
            :title="isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'"
            class="btn px-4 py-2 rounded shadow-sm d-flex align-items-center gap-2"
          >
            <i class="fas fa-heart"></i>
            {{ isFavorite ? "Đã thích" : "Yêu thích" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "../../store/AuthStore"; // Import AuthStore
import Breadcrumb from "./Breadcrumb.vue";
import axios from "axios";
import { useToast } from "vue-toastification"; // Import toast

export default {
  name: "ProductDetail",
  components: { Breadcrumb },
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const authStore = useAuthStore(); // Lấy store auth
    const toast = useToast(); // Khởi tạo toast
    const mainImage = ref({ alt: "Main Image", src: props.product.images[0] });
    const galleryImages = ref(props.product.images);
    const currentIndex = ref(0);
    const isFavorite = ref(false); // Trạng thái yêu thích
    const favoriteCount = ref(0);

    let interval = null; // Lưu interval để quản lý vòng lặp

    // Chọn ảnh chính khi hover vào ảnh nhỏ
    const hoverImage = (image) => {
      mainImage.value = { alt: "Main Image", src: image };
      currentIndex.value = galleryImages.value.indexOf(image);
      clearInterval(interval); // Tạm dừng tự động chuyển ảnh khi hover
    };

    // Tiếp tục tự động chuyển ảnh khi rời chuột khỏi ảnh nhỏ
    const resumeAutoSlide = () => {
      startAutoSlide();
    };

    // Chọn ảnh chính khi click vào ảnh nhỏ
    const selectMainImage = (image) => {
      mainImage.value = { alt: "Main Image", src: image };
      currentIndex.value = galleryImages.value.indexOf(image);
      clearInterval(interval); // Dừng tự động đổi ảnh khi người dùng chọn ảnh
    };

    // Tự động chuyển ảnh theo vòng lặp
    const startAutoSlide = () => {
      clearInterval(interval); // Đảm bảo không có interval nào đang chạy
      interval = setInterval(() => {
        currentIndex.value =
          (currentIndex.value + 1) % galleryImages.value.length;
        mainImage.value = {
          alt: "Main Image",
          src: galleryImages.value[currentIndex.value],
        };
      }, 3000);
    };

    // Format giá sản phẩm
    const formatPrice = (price) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    };

    // Kiểm tra đăng nhập (token)
    const checkAuth = () => {
      if (!authStore.isAuthenticated()) {
        return false; // Trả về false nếu chưa đăng nhập
      }
      return true;
    };

    // Kiểm tra trạng thái yêu thích của sản phẩm
    const checkFavoriteStatus = async () => {
      // Kiểm tra trạng thái yêu thích nhưng không hiển thị thông báo đăng nhập
      if (!authStore.isAuthenticated()) {
        isFavorite.value = false; // Nếu chưa đăng nhập, coi như không yêu thích
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/api/favorites/check/${props.product._id}`,
          {
            headers: { Authorization: `Bearer ${authStore.token}` },
          }
        );
        isFavorite.value = response.data.isFavorite;
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái yêu thích:", error);
      }
    };

    // Toggle yêu thích
    const toggleFavorite = async () => {
      if (!checkAuth()) {
        toast.info("Vui lòng đăng nhập"); // Hiển thị thông báo lỗi
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:3000/api/favorites/toggle",
          { productId: props.product._id },
          {
            headers: { Authorization: `Bearer ${authStore.token}` },
          }
        );
        isFavorite.value = !isFavorite.value;
        toast.success(response.data.message); // Hiển thị thông báo thành công
      } catch (error) {
        console.error("Lỗi khi thực hiện yêu thích:", error);
        toast.error("Đã có lỗi xảy ra, vui lòng thử lại."); // Hiển thị thông báo lỗi
      }
    };

    //thêm vào giỏ hàng
    const addToCart = async () => {
      if (!checkAuth()) {
        toast.info("Vui lòng đăng nhập");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:3000/api/cart/add",
          { productId: props.product._id }, // Giả sử số lượng mặc định là 1
          {
            headers: { Authorization: `Bearer ${authStore.token}` },
          }
        );

        // Kiểm tra xem backend có thông báo gì không và hiển thị toast
        if (response.data.message) {
          toast.success(response.data.message); // Thông báo thành công từ backend
        } else {
          toast.success("Đã thêm vào giỏ hàng"); // Mặc định thông báo thành công
        }
      } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error);

        // Nếu backend trả về lỗi trong response
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          toast.error(error.response.data.message); // Thông báo lỗi từ backend
        } else {
          toast.error("Thêm vào giỏ hàng thất bại"); // Mặc định thông báo lỗi
        }
      }
    };

    const fetchFavoriteCount = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/favorites/count/${props.product._id}`
        );
        favoriteCount.value = response.data.favoriteCount || 0;
      } catch (error) {
        console.error("Lỗi khi lấy số lượng yêu thích:", error);
      }
    };

    // Watch props để cập nhật khi sản phẩm thay đổi
    watch(
      () => props.product,
      (newProduct) => {
        mainImage.value = { alt: "Main Image", src: newProduct.images[0] };
        galleryImages.value = newProduct.images;
        checkFavoriteStatus(); // Kiểm tra trạng thái yêu thích sau khi sản phẩm thay đổi
      }
    );

    // Dừng auto slide khi component bị unmounted
    onUnmounted(() => {
      clearInterval(interval);
    });

    // Kiểm tra trạng thái yêu thích khi component được mounted
    onMounted(() => {
      checkFavoriteStatus();
      startAutoSlide();
      fetchFavoriteCount();
    });

    return {
      mainImage,
      galleryImages,
      hoverImage,
      resumeAutoSlide,
      currentIndex,
      selectMainImage,
      formatPrice,
      isFavorite,
      toggleFavorite,
      addToCart,
      favoriteCount,
    };
  },
};
</script>

<style scoped>
.btn-danger {
  background-color: #f54291;
  border-color: #f54291;
}
.btn-danger:hover {
  background-color: #d82f7f;
  border-color: #d82f7f;
}
</style>
