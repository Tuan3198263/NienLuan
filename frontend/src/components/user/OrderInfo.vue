<template>
  <div class="bg-white p-4 rounded-lg shadow-md">
    <!-- Navigation Tabs -->
    <div class="d-flex flex-wrap overflow-auto border-bottom">
      <a
        v-for="status in statuses"
        :key="status.value"
        href="#"
        class="py-2 px-4 text-decoration-none"
        :class="{
          'border-bottom border-dark': selectedStatus === status.value,
          'text-dark': selectedStatus === status.value,
          'text-muted': selectedStatus !== status.value,
        }"
        @click="filterOrders(status.value)"
      >
        {{ status.label }}
      </a>
    </div>

    <!-- Search Bar -->
    <div class="my-4 position-relative">
      <input
        type="text"
        placeholder="Tìm kiếm"
        class="form-control ps-5"
        v-model="searchQuery"
      />
      <i
        class="fa fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
      ></i>
    </div>

    <!-- Order List -->
    <div class="space-y-4">
      <template v-if="paginatedOrders.length > 0">
        <div
          class="p-4 border rounded-lg bg-white shadow-md mb-3"
          v-for="order in paginatedOrders"
          :key="order._id"
        >
          <div class="d-flex justify-content-between">
            <span>{{ formatDate(order.orderDate) }}</span>
            <span
              >Mã đơn hàng: <strong>{{ order.orderCode }}</strong></span
            >
          </div>
          <div class="mt-2">
            <p>
              Hình thức: <strong>Giao hàng</strong> {{ order.items.length }} Sản
              phẩm ( <strong>{{ formatPrice(order.totalPrice) }}</strong
              >)
            </p>
            <p class="address-ellipsis text-ellipsis">
              Giao đến: {{ order.shippingInfo.address }},
              {{ order.shippingInfo.wardName }},
              {{ order.shippingInfo.districtName }},
              {{ order.shippingInfo.cityName }}
            </p>
          </div>
          <div class="mt-2 d-flex justify-content-between align-items-center">
            <span>
              Tình trạng:
              <strong
                :class="['badge text-white p-2', getStatusClass(order.status)]"
              >
                {{ getStatusLabel(order.status) }}
              </strong>
            </span>

            <div class="btn-group">
              <router-link
                :to="`/order-details/${order.orderCode}`"
                class="btn btn-outline-secondary"
              >
                Xem chi tiết
              </router-link>
            </div>
          </div>
        </div>
      </template>

      <!-- Hiển thị nếu không có đơn hàng -->
      <div v-else class="text-center mt-4">
        <i class="fa fa-box-open text-secondary" style="font-size: 3rem"></i>
        <p class="mt-2 text-muted">Không tìm thấy đơn hàng</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-center mt-4" v-if="totalPages > 1">
      <button
        class="btn btn-outline-secondary mx-1"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        Trước
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        class="btn mx-1"
        :class="{
          'btn-primary': page === currentPage,
          'btn-outline-secondary': page !== currentPage,
        }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>

      <button
        class="btn btn-outline-secondary mx-1"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        Tiếp theo
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "../../store/AuthStore";

const searchQuery = ref("");
const selectedStatus = ref("all");
const authStore = useAuthStore();

const orders = ref([]);
const currentPage = ref(1);
const pageSize = 2; // Mỗi trang hiển thị 2 đơn hàng

const getStatusClass = (status) => {
  return {
    "bg-warning": status === "pending",
    "bg-primary": status === "processed",
    "bg-info": status === "shipped",
    "bg-success": status === "delivered",
    "bg-danger": status === "canceled" || status === "returned",
  };
};

const statuses = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Đã xác nhận", value: "confirmed" },
  { label: "Đang giao", value: "shipping" },
  { label: "Đã nhận", value: "delivered" },
  { label: "Đã hủy", value: "cancelled" },
  { label: "Đã trả", value: "returned" },
];

const statusMap = {
  pending: "Chờ xác nhận",
  processed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã nhận",
  canceled: "Đã hủy",
  returned: "Đã trả",
};

const getStatusLabel = (status) => {
  return statusMap[status] || "Không xác định";
};

const fetchOrders = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/order?status=${selectedStatus.value}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );
    orders.value = response.data.orders;
    currentPage.value = 1; // Reset về trang đầu khi lọc đơn hàng mới
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
  }
};

const filteredOrders = computed(() => {
  let filtered = orders.value;

  // Lọc theo tìm kiếm
  filtered = filtered.filter((order) =>
    order.orderCode.toLowerCase().includes(searchQuery.value.toLowerCase())
  );

  return filtered;
});

// Tính toán số trang
const totalPages = computed(() =>
  Math.ceil(filteredOrders.value.length / pageSize)
);

// Lọc danh sách theo trang hiện tại
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredOrders.value.slice(start, start + pageSize);
});

// Chuyển trang
const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const filterOrders = async (status) => {
  selectedStatus.value = status;
  await fetchOrders();
};

onMounted(fetchOrders);
</script>

<style scoped>
/* Styling cho phần đơn hàng */

.rounded-lg {
  border-radius: 10px;
}

.shadow-md {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.border-bottom {
  border-bottom: 2px solid #ccc;
}
</style>
