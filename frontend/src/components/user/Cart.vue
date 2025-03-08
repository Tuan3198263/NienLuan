<template>
  <div class="container my-4">
    <Breadcrumb />
    <div class="row">
      <!-- Left section (7/12) -->
      <div class="col-md-7">
        <!-- Địa chỉ nhận hàng -->
        <div class="bg-white p-4 rounded shadow-sm mb-4">
          <div class="section-header">
            <div class="d-flex align-items-center">
              <i
                class="fas fa-map-marker-alt fa-lg text-muted section-icon"
              ></i>
              <span class="section-title">ĐỊA CHỈ NHẬN HÀNG</span>
            </div>
            <router-link to="/profile/address" class="cursor-pointer">
              <i class="fas fa-edit text-muted" title="Chỉnh sửa địa chỉ"></i>
            </router-link>
          </div>

          <!-- Kiểm tra nếu có địa chỉ -->
          <div v-if="shippingAddress && shippingAddress.fullName">
            <div class="text-muted">
              <p>{{ shippingAddress.fullName }}, {{ shippingAddress.phone }}</p>
              <p class="text-secondary fw-bold">
                {{ shippingAddress.address }}, {{ shippingAddress.wardName }},
                {{ shippingAddress.districtName }},
                {{ shippingAddress.cityName }}
              </p>
            </div>
          </div>

          <!-- Nếu không có địa chỉ -->
          <div v-else>
            <p class="text-danger fw-bold">
              Bạn chưa có địa chỉ nhận hàng, vui lòng cập nhật địa chỉ!
            </p>
          </div>
        </div>

        <!-- Cart Section -->
        <div class="bg-white p-4 rounded shadow-sm mb-4">
          <div
            class="d-flex justify-content-between align-items-center mb-4 section-header"
          >
            <div class="d-flex align-items-center">
              <i class="fas fa-shopping-bag fa-lg text-muted section-icon"></i>
              <span class="section-title"
                >GIỎ HÀNG ({{ cart.items.length }} SẢN PHẨM)</span
              >
            </div>
          </div>

          <!-- Hiển thị sản phẩm: chỉ hiển thị tối đa 3 sản phẩm khi chưa mở rộng -->
          <div
            v-for="(item, index) in showAllItems.expanded
              ? cart.items
              : cart.items.slice(0, 3)"
            :key="index"
            class="product-card"
          >
            <!-- Nút xóa sản phẩm gọi deleteItemFromCart -->
            <button
              class="btn-delete"
              @click="deleteItemFromCart(item.productId._id)"
              title="Xóa"
            >
              <i class="fas fa-times"></i>
            </button>

            <!-- Thêm router-link để bao bọc ảnh và thêm cursor-pointer -->
            <router-link :to="`/product/${item.productId.slug}`">
              <img
                :src="item.productId.images[0]"
                alt="Sản phẩm"
                class="cursor-pointer"
              />
            </router-link>
            <div class="product-info">
              <p
                class="product-name mb-1 text-secondary"
                :title="item.productId.name"
              >
                {{ item.productId.name }}
              </p>
              <p class="product-price mb-2 fw-bold">
                {{ formatCurrency(item.productId.price) }}
              </p>
              <div class="product-quantity">
                <button
                  class="btn btn-outline-secondary btn-sm"
                  @click="decreaseQuantity(item)"
                >
                  -
                </button>
                <span class="mx-2">{{ item.quantity }}</span>
                <button
                  class="btn btn-outline-secondary btn-sm"
                  @click="increaseQuantity(item)"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <!-- Xem thêm/Thu gọn Button -->
          <div class="text-center mt-3" v-if="cart.items.length > 3">
            <button
              class="btn btn-link text-decoration-none text-dark"
              @click="toggleExpand"
            >
              {{ showAllItems.expanded ? "Thu gọn" : "Xem thêm" }}
            </button>
          </div>
        </div>

        <!-- Delivery Method Section -->
        <DeliveryMethod :shippingAddress="shippingAddress" />

        <!-- Payment Method Section -->
        <PaymentMethod />
      </div>

      <!-- Right section (3/12) -->
      <div class="col-md-5">
        <!-- Order Summary Section -->
        <OrderSummary :cart="cart" :shippingAddress="shippingAddress" />
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed, onMounted } from "vue";
import { useAuthStore } from "../../store/AuthStore"; // Import AuthStore
import Swal from "sweetalert2"; // Import SweetAlert2
import { useToast } from "vue-toastification"; // Import Toast
import axios from "axios"; // Import axios
import Breadcrumb from "./Breadcrumb.vue";
import OrderSummary from "./OrderSumary.vue"; // Import component OrderSummary
import PaymentMethod from "./PaymentMethod.vue";
import DeliveryMethod from "./DeliveryMethod.vue";

export default {
  name: "Cart",
  components: { Breadcrumb, OrderSummary, PaymentMethod, DeliveryMethod },
  setup() {
    const authStore = useAuthStore(); // Lấy store auth
    const toast = useToast(); // Khởi tạo useToast
    const cart = reactive({
      items: [],
      totalPrice: 0, // Để giá trị tổng tiền ở đây
    });

    const shippingAddress = reactive({
      fullName: "",
      phone: "",
      address: "",
      cityName: "",
      districtName: "",
      wardName: "",
      to_district_id: "",
      to_ward_code: "",
    });

    const fetchShippingAddress = () => {
      axios
        .get("http://localhost:3000/api/shipping-address/", {
          headers: { Authorization: `Bearer ${authStore.token}` },
        })
        .then((response) => {
          // Kiểm tra xem response.data và response.data.data có tồn tại hay không
          if (response.data && response.data.success && response.data.data) {
            const {
              fullName,
              phone,
              address,
              cityName,
              districtName,
              wardName,
              district, // Đảm bảo API trả về mã này
              ward, // Đảm bảo API trả về mã này
            } = response.data.data;

            // Gán giá trị vào shippingAddress nếu có dữ liệu
            shippingAddress.fullName = fullName;
            shippingAddress.phone = phone;
            shippingAddress.address = address;
            shippingAddress.cityName = cityName;
            shippingAddress.districtName = districtName;
            shippingAddress.wardName = wardName;
            shippingAddress.to_district_id = district;
            shippingAddress.to_ward_code = ward;
          } else {
            console.log("Người dùng chưa có thông tin địa chỉ");
          }
        })
        .catch((error) => {
          // Xử lý khi có lỗi trong việc gọi API
          console.error("Lỗi khi lấy địa chỉ:", error);
        });
    };

    // Trạng thái xem thêm/thu gọn
    const showAllItems = reactive({
      expanded: false, // mặc định là thu gọn
    });

    const toggleExpand = () => {
      showAllItems.expanded = !showAllItems.expanded;
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    };

    const fetchCartData = () => {
      axios
        .get("http://localhost:3000/api/cart/", {
          headers: { Authorization: `Bearer ${authStore.token}` },
        })
        .then((response) => {
          if (response.data.cart) {
            cart.items = response.data.cart.items || []; // Gán giá trị mặc định nếu không có items
            cart.totalPrice = response.data.cart.totalPrice || 0; // Gán giá trị mặc định nếu không có totalPrice
          } else {
            // Nếu không có giỏ hàng, gán giỏ hàng trống
            cart.items = [];
            cart.totalPrice = 0;
          }
        })
        .catch((error) => {
          console.error("Error fetching cart data:", error);
        });
    };

    const increaseQuantity = (item) => {
      // Gọi API để tăng số lượng sản phẩm
      axios
        .post(
          "http://localhost:3000/api/cart/add",
          {
            productId: item.productId._id, // Truyền ID sản phẩm để tăng số lượng
            quantity: 1, // Tăng số lượng 1
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        )
        .then((response) => {
          fetchCartData(); // Cập nhật giỏ hàng sau khi tăng số lượng
        })
        .catch((error) => {
          console.error("Lỗi khi tăng số lượng sản phẩm:", error);

          // Hiển thị thông báo lỗi khi có lỗi
          if (
            error.response &&
            error.response.data &&
            error.response.data.message
          ) {
            toast.error(error.response.data.message); // Hiển thị thông báo lỗi từ backend
          } else {
            toast.error("Đã xảy ra lỗi khi tăng số lượng sản phẩm"); // Thông báo lỗi mặc định
          }
        });
    };

    const removeItem = (productId) => {
      axios
        .post(
          "http://localhost:3000/api/cart/remove",
          { productId },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        )
        .then((response) => {
          fetchCartData(); // Cập nhật giỏ hàng sau khi xóa sản phẩm
        })
        .catch((error) => {
          console.error("Lỗi khi xóa sản phẩm:", error);
        });
    };

    const decreaseQuantity = (item) => {
      if (item.quantity > 1) {
        // Gọi API giảm số lượng
        removeItem(item.productId._id); // Gọi removeItem để giảm số lượng
      } else {
        // Nếu số lượng = 1, yêu cầu xác nhận trước khi xóa
        Swal.fire({
          title: "Bạn chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Đồng ý",
          cancelButtonText: "Hủy",
        }).then((result) => {
          if (result.isConfirmed) {
            toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
            removeItem(item.productId._id); // Gọi removeItem để xóa sản phẩm
          } else {
            console.log("Không xóa sản phẩm.");
          }
        });
      }
    };

    const deleteItemFromCart = (productId) => {
      // Hiển thị hộp thoại xác nhận
      Swal.fire({
        title: "Bạn chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          // Nếu người dùng xác nhận, tiến hành xóa sản phẩm
          axios
            .post(
              "http://localhost:3000/api/cart/delete",
              { productId },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${authStore.token}`,
                },
              }
            )
            .then((response) => {
              // Cập nhật lại giỏ hàng sau khi xóa sản phẩm
              fetchCartData();
              toast.success("Đã xóa sản phẩm khỏi giỏ hàng"); // Thông báo thành công
            })
            .catch((error) => {
              toast.error("Đã có lỗi xảy ra khi xóa sản phẩm"); // Thông báo lỗi khi không xóa được sản phẩm
            });
        } else {
          console.log("Người dùng hủy hành động xóa sản phẩm.");
        }
      });
    };

    onMounted(() => {
      fetchCartData();
      fetchShippingAddress(); // Gọi phương thức khi component được mount
    });

    return {
      shippingAddress,
      showAllItems,
      toggleExpand,
      formatCurrency,
      cart,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      deleteItemFromCart,
      fetchCartData,
    };
  },
};
</script>

<style scoped>
/* Add any custom styles you need here */
</style>

<style scoped>
/* Style chung cho các header section */
.section-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-card {
  display: flex;
  align-items: flex-start;
  position: relative;
  padding: 15px 0;
  border-bottom: 1px solid #dee2e6; /* Đường ngăn cách giữa các sản phẩm */
}

.product-card:last-child {
  border-bottom: none; /* Loại bỏ đường ngăn cách cho sản phẩm cuối cùng */
}

.product-card img {
  width: 100px;
  height: 80px;
  margin-right: 15px;
}

.product-info {
  flex-grow: 1;
  position: relative;
  padding-right: 25px;
}

.product-quantity {
  display: flex;
  align-items: center;
}

.product-quantity button {
  padding: 2px 10px;
}

.btn-delete {
  position: absolute;
  top: 0;
  right: 0;
  color: #999;
  background: none;
  border: none;
  padding: 0;
  font-size: 1.2rem;
}

.section-icon {
  margin-right: 12px !important;
}

.product-info {
  flex-grow: 1;
  position: relative;
  padding-right: 25px;
  max-width: calc(100% - 110px); /* 90px ảnh + 15px margin */
}

.product-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
