<template>
  <div class="container">
    <div v-if="order" class="bg-white p-4 rounded shadow-sm">
      <p class="text-start text-muted small fw-bold text-lg">
        Mã đơn hàng:
        <span class="text-secondary">{{ order.orderCode }}</span>
      </p>

      <p class="text-start text-muted small fw-bold text-lg">
        Ngày giao dự kiến:
        <span class="text-secondary">{{ deliveryDate }}</span>
      </p>

      <p class="text-start text-muted small fw-bold text-lg">
        Trạng thái:
        <strong :class="['badge text-white p-2', statusClass]">
          {{ orderStatusText }}
        </strong>
      </p>

      <div class="row row-cols-1 row-cols-md-3 g-4 mt-4">
        <div class="col">
          <div class="border p-4 rounded h-100 bg-light">
            <h4 class="fw-bold">Thông tin nhận hàng</h4>
            <p>
              <strong>{{ order.shippingInfo.fullName }}</strong>
            </p>
            <p>{{ order.shippingInfo.phone }}</p>
            <p>
              {{ order.shippingInfo.address }},
              {{ order.shippingInfo.districtName }},
              {{ order.shippingInfo.cityName }}
            </p>
          </div>
        </div>
        <div class="col">
          <div class="border p-4 rounded h-100 bg-light">
            <h4 class="fw-bold">Phương thức thanh toán</h4>
            <p>{{ payment.method }}</p>
            <p>
              Quý khách vui lòng thanh toán
              {{ formatCurrency(order.totalPrice) }} khi nhận hàng
            </p>
          </div>
        </div>
        <div class="col">
          <div class="border p-4 rounded h-100 bg-light">
            <h4 class="fw-bold">Thông tin vận chuyển</h4>
            <p>
              Phí vận chuyển:
              {{ formatCurrency(order.shippingFeeDetails.finalFee) }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <h2 class="fw-bold fs-5">Đơn hàng</h2>
        <div class="mt-4">
          <div
            v-for="item in order.items"
            :key="item._id"
            class="d-flex align-items-center gap-3 mt-3 border-bottom pb-3"
          >
            <!-- Sử dụng router-link để bọc ảnh, dẫn đến trang chi tiết sản phẩm -->
            <router-link :to="`/product/${item.productId.slug}`">
              <img
                :src="item.productId.images[0]"
                class="img-thumbnail"
                :alt="item.productId.name"
              />
            </router-link>
            <div class="flex-grow-1">
              <p class="fw-bold mb-1 text-primary">
                {{ item.productId.brand.name }}
              </p>
              <p class="mb-1" :title="item.productId.name">
                {{ item.productId.name }}
              </p>
            </div>
            <div class="text-end">
              <p class="fw-bold mb-1 text-danger">
                {{ formatCurrency(item.priceAtTime) }}
                <span class="text-muted small"> x{{ item.quantity }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 border-top pt-3">
        <!-- Tạm tính: Tổng giá trị sản phẩm chưa tính phí vận chuyển -->
        <div class="d-flex justify-content-between">
          <p class="fw-bold">Tạm tính</p>
          <p class="fw-bold">{{ formatCurrency(productSubtotal) }}</p>
        </div>
        <!-- Phí vận chuyển gốc: hiển thị với hiệu ứng gạch ngang -->
        <div class="d-flex justify-content-between mt-1">
          <p class="text-muted" style="text-decoration: line-through">
            Phí vận chuyển gốc
          </p>
          <p class="text-muted" style="text-decoration: line-through">
            {{ formatCurrency(subtotal) }}
          </p>
        </div>
        <div class="d-flex justify-content-between mt-1">
          <p class="text-muted">Giảm phí vận chuyển</p>
          <p class="text-muted">{{ formatCurrency(discount) }}</p>
        </div>
        <div class="d-flex justify-content-between mt-1">
          <p class="text-muted">Phí vận chuyển (đã được giảm)</p>
          <p class="text-primary">{{ formatCurrency(shippingFee) }}</p>
        </div>
        <div class="d-flex justify-content-between mt-1">
          <p class="fw-bold text-uppercase">Tổng cộng</p>
          <p class="fw-bold text-danger text-lg">{{ formatCurrency(total) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "../../store/AuthStore";

const authStore = useAuthStore();

const order = ref(null);
const deliveryDate = ref("");
const payment = ref({
  method: "Trả tiền mặt khi nhận hàng (COD)",
});

// Nhận orderCode từ prop
const props = defineProps({
  orderCode: String,
});

// Các giá trị đã tính sẵn từ API
const subtotal = ref(0);
const discount = ref(0);
const shippingFee = ref(0);
const total = ref(0);

// Tính tổng giá trị các sản phẩm (chưa tính phí vận chuyển)
// Nếu API không cung cấp, ta tính tại client
const productSubtotal = computed(() => {
  if (order.value) {
    return order.value.items.reduce(
      (sum, item) => sum + item.priceAtTime * item.quantity,
      0
    );
  }
  return 0;
});

const orderStatusMapping = {
  pending: "Chờ xác nhận",
  processed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã nhận",
  canceled: "Đã hủy",
  returned: "Đã trả",
};

const orderStatusText = computed(
  () => orderStatusMapping[order.value?.status] || ""
);

const statusClass = computed(() => {
  return {
    "bg-warning": order.value?.status === "pending",
    "bg-primary": order.value?.status === "processed",
    "bg-info": order.value?.status === "shipped",
    "bg-success": order.value?.status === "delivered",
    "bg-danger":
      order.value?.status === "canceled" || order.value?.status === "returned",
  };
});

const fetchOrderDetails = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/order/details/${props.orderCode}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    order.value = response.data.order;

    if (order.value?.estimatedDeliveryDate) {
      deliveryDate.value = new Date(
        order.value.estimatedDeliveryDate
      ).toLocaleDateString("vi-VN");
    }

    // Lấy dữ liệu từ API đã tính sẵn (không tính lại phía client)
    subtotal.value = order.value.shippingFeeDetails.mainFee;
    discount.value = order.value.shippingFeeDetails.discount;
    shippingFee.value = order.value.shippingFeeDetails.finalFee;
    total.value = order.value.totalPrice;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

onMounted(fetchOrderDetails);
</script>

<style scoped>
.img-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}
.text-lg {
  font-size: 1.2rem;
}
</style>
