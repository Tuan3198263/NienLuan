<template>
  <div v-if="isLoading" class="text-center">
    <p>Đang tải sản phẩm...</p>
  </div>
  <div v-else>
    <!-- Hiển thị các component con chỉ khi dữ liệu đã được tải và hợp lệ -->
    <ProductDetail v-if="product" :product="product" />
    <ProductInfoTabs v-if="product" :product-info="product" />
    <Reviews v-if="product" :product-id="product._id" />
    <!-- Nếu không có sản phẩm, có thể hiển thị thông báo -->
    <div v-else>
      <p>Sản phẩm không tồn tại.</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import ProductDetail from "../../components/user/ProductDetail.vue";
import ProductInfoTabs from "../../components/user/ProductInfoTabs.vue";
import Reviews from "../../components/user/Reviews.vue";

export default {
  name: "ProductDetailPage",
  components: {
    ProductDetail,
    ProductInfoTabs,
    Reviews,
  },
  setup() {
    const route = useRoute();
    const router = useRouter(); // Dùng để chuyển hướng
    const product = ref(null); // Dữ liệu sản phẩm
    const isLoading = ref(true); // Trạng thái tải dữ liệu
    const error = ref(false); // Biến lưu trạng thái lỗi

    const fetchProduct = async () => {
      try {
        const slug = route.params.slug;
        const response = await axios.get(
          `http://localhost:3000/api/products/product-slug/${slug}`
        );

        // Xử lý trường hợp API trả về thành công nhưng không có product
        if (!response.data.product) {
          router.push({ name: "NotFound" });
          return;
        }

        product.value = response.data.product;
      } catch (err) {
        // Xử lý các loại lỗi khác nhau
        if (err.response && err.response.status === 404) {
          router.push({ name: "NotFound" });
        } else {
          error.value = true;
          console.error("Lỗi khi lấy thông tin sản phẩm:", err);
        }
      } finally {
        isLoading.value = false; // Kết thúc trạng thái tải
      }
    };

    onMounted(() => {
      fetchProduct();
    });

    return {
      product,
      isLoading,
      error, // Trả về error để hiển thị thông báo lỗi
    };
  },
};
</script>

<style scoped>
.text-center {
  text-align: center;
  font-size: 16px;
  color: #6c757d;
}
.text-danger {
  color: #dc3545;
}
</style>
