<template>
  <div class="order-summary p-4 rounded shadow-sm bg-white">
    <div
      class="discount-banner d-flex align-items-center justify-content-between p-3 mb-4"
    >
      <i class="fas fa-tags text-danger"></i>
      <span class="discount-text">Áp dụng ưu đãi để được giảm giá</span>
      <i class="fas fa-chevron-right text-muted"></i>
    </div>

    <div class="border-top pt-3">
      <div class="d-flex justify-content-between mb-3">
        <span class="text-muted">Tiền hàng</span>
        <span class="fw-bold text-dark">{{
          formatCurrency(cart.totalPrice)
        }}</span>
      </div>

      <div class="d-flex justify-content-between mb-3 align-items-center">
        <div>
          <span class="text-muted">Giao hàng nhanh</span>
          <i class="fas fa-shipping-fast text-muted ms-1"></i>
          <br />
          <small class="text-success">
            <i class="fas fa-tags"></i> Giảm phí vận chuyển từ 5-25K khi thanh
            toán
          </small>
        </div>
        <span class="fw-bold text-dark">
          {{
            shippingFee !== null ? formatCurrency(shippingFee) : "Đang tính..."
          }}
        </span>
      </div>
    </div>

    <div class="order-summary-footer border-top pt-3">
      <div class="total-amount d-flex justify-content-between">
        <span class="total-label">Tổng tiền</span>
        <span class="total-price">{{
          formatCurrency(cart.totalPrice + (shippingFee || 0))
        }}</span>
      </div>
      <!-- Disable button if cart is empty or not available -->
      <button
        :class="[
          'btn',
          'w-100',
          'mt-3',
          cart.items.length === 0 || !isShippingAddressValid
            ? 'btn-secondary'
            : 'btn-primary',
        ]"
        :disabled="cart.items.length === 0 || !isShippingAddressValid"
        @click="placeOrder"
      >
        ĐẶT HÀNG
      </button>
    </div>
  </div>
</template>
<script>
import { defineComponent, toRefs, ref, watch, computed } from "vue";
import Swal from "sweetalert2"; // Import SweetAlert2

import axios from "axios";
import { useAuthStore } from "../../store/AuthStore"; // Import AuthStore

export default defineComponent({
  name: "OrderSummary",
  props: {
    cart: { type: Object, required: true },
    shippingAddress: { type: Object, required: true, default: () => ({}) },
  },
  setup(props) {
    const authStore = useAuthStore(); // Lấy store auth
    const { cart, shippingAddress } = toRefs(props);
    const shippingFee = ref(null);
    const loading = ref(false);

    const formatCurrency = (value) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    };

    // chỉ cần ràng buộc 1 trường thôi vì api thay đổi bắt buộc nhập full
    const isShippingAddressValid = computed(() => {
      return props.shippingAddress.fullName;
    });

    const fetchShippingFee = async () => {
      if (
        !shippingAddress.value?.to_district_id ||
        !shippingAddress.value?.to_ward_code ||
        !cart.value?.totalPrice
      ) {
        shippingFee.value = 0;
        return;
      }

      try {
        const response = await axios.post(
          "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
          {
            service_type_id: 2,
            to_district_id: parseInt(shippingAddress.value.to_district_id, 10),
            to_ward_code: shippingAddress.value.to_ward_code,
            weight: 1500,
            insurance_value: cart.value.totalPrice,
          },
          {
            headers: {
              Token: import.meta.env.VITE_GHN_API_TOKEN,
              ShopId: import.meta.env.VITE_GHN_SHOP_ID,
              "Content-Type": "application/json",
            },
          }
        );

        shippingFee.value =
          response.data.code === 200 ? response.data.data.total : 0;
      } catch (error) {
        console.error("Lỗi khi lấy phí vận chuyển:", error);
        shippingFee.value = 0;
      }
    };

    const placeOrder = async () => {
      if (cart.value.items.length === 0) {
        Swal.fire("Thông báo", "Giỏ hàng trống!", "warning");
        return;
      }

      if (cart.value.totalPrice > 5000000) {
        Swal.fire({
          title: "Cảnh báo!",
          text: "Đơn hàng không thể vượt quá 5.000.000 VNĐ.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      const result = await Swal.fire({
        title: "Xác nhận đặt hàng",
        text: "Bạn có chắc chắn muốn đặt hàng không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đặt hàng",
        cancelButtonText: "Hủy",
      });

      if (!result.isConfirmed) {
        return;
      }

      Swal.fire({
        title: "Đang xử lý...",
        text: "Vui lòng đợi trong giây lát...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const plainShippingInfo = JSON.parse(
        JSON.stringify(shippingAddress.value)
      );

      // Tạo danh sách items để gửi lên API
      const orderItems = cart.value.items.map((item) => ({
        name: item.productId.name,
        quantity: item.quantity,
        price: item.priceAtTime,
      }));

      loading.value = true;

      console.log(
        "🔍 Dữ liệu gửi lên:",
        JSON.stringify(
          {
            shippingInfo: plainShippingInfo,
            insurance_value: cart.value.totalPrice,
            shipping_fee_input: shippingFee.value,
            items: orderItems, // Log thêm items
          },
          null,
          2
        )
      );

      try {
        const response = await axios.post(
          "http://localhost:3000/api/order/create-order",
          {
            shippingInfo: plainShippingInfo,
            insurance_value: cart.value.totalPrice,
            shipping_fee_input: shippingFee.value,
            items: orderItems, // Gửi danh sách sản phẩm
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );

        if (response.status === 201) {
          await Swal.fire({
            title: "Đặt hàng thành công!",
            text: "Đơn hàng của bạn đã được tạo.",
            icon: "success",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error("❌ Lỗi khi tạo đơn hàng:", error);

        // Nếu có lỗi từ server, hiển thị thông báo lỗi cụ thể
        if (error.response) {
          const serverError = error.response.data;

          Swal.fire({
            title: "Lỗi!",
            text: serverError.message || "Đã xảy ra lỗi khi tạo đơn hàng.",
            icon: "error",
            confirmButtonText: "Thử lại",
          });
        } else {
          // Nếu không có lỗi cụ thể, hiển thị lỗi không xác định
          Swal.fire({
            title: "Lỗi không xác định!",
            text: "Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại sau.",
            icon: "error",
            confirmButtonText: "Thử lại",
          });
        }
      } finally {
        loading.value = false;
      }
    };

    watch([shippingAddress, () => cart.value.totalPrice], fetchShippingFee, {
      immediate: true,
    });

    return {
      cart,
      shippingAddress,
      shippingFee,
      formatCurrency,
      placeOrder,
      isShippingAddressValid,
    };
  },
});
</script>

<style scoped>
.discount-banner {
  background: #ffecec;
  border-radius: 8px;
}
.discount-text {
  font-weight: 500;
  color: #d9534f;
}
.total-amount {
  font-size: 1.2rem;
  font-weight: bold;
}
.total-label {
  color: rgb(156, 152, 152);
}
.total-price {
  color: rgb(156, 152, 152);
  font-size: 1.4rem;
}
button {
  font-size: 1.1rem;
  padding: 10px;
  border-radius: 8px;
}

@media (max-width: 767.98px) {
  .order-summary {
    margin-bottom: 140px;
  }
  .order-summary-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: white;
    padding: 16px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  }
  .discount-banner {
    display: none;
  }
  .total-amount {
    font-size: 1rem;
  }
  .total-price {
    font-size: 1.2rem;
  }
  button {
    font-size: 1rem;
    padding: 8px;
  }
}
</style>
