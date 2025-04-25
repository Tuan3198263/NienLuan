<template>
  <div class="">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="fw-bold">Quản Lý Đơn Hàng</h4>
        <!-- Thêm thông báo đơn hàng cần xử lý -->
        <div
          v-if="pendingOrdersCount > 0"
          class="mt-2 alert alert-warning py-1 px-3 d-inline-block"
        >
          <i class="fas fa-exclamation-circle me-2"></i>
          <strong>Bạn đang có {{ pendingOrdersCount }} đơn cần xử lí</strong>
        </div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-success" @click="exportToExcel">
          <i class="fas fa-file-excel me-2"></i>Xuất Excel
        </button>
        <a
          href="https://5sao.ghn.dev/"
          target="_blank"
          class="btn btn-secondary"
        >
          <i class="fas fa-store me-2"></i>Cửa Hàng
        </a>
      </div>
    </div>

    <!-- Bộ lọc tìm kiếm -->
    <div class="card p-3 mb-4">
      <div class="row g-3">
        <div class="col-md-3">
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-search"></i></span>
            <input
              v-model="filters.orderCode"
              type="text"
              class="form-control"
              placeholder="Tìm theo mã đơn hàng"
            />
          </div>
        </div>
        <div class="col-md-3">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-filter"></i>
            </span>
            <select v-model="filters.status" class="form-select">
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="processed">Đã xác nhận</option>
              <option value="shipped">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="canceled">Đã hủy</option>
              <option value="returned">Đã trả hàng</option>
            </select>
          </div>
        </div>
        <div class="col-md-3">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-calendar"></i>
            </span>
            <input
              v-model="filters.startDate"
              type="date"
              class="form-control"
              placeholder="Từ ngày"
            />
          </div>
        </div>
        <div class="col-md-3">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-calendar"></i>
            </span>
            <input
              v-model="filters.endDate"
              type="date"
              class="form-control"
              placeholder="Đến ngày"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Số lượng hiển thị trên mỗi trang & Tổng số đơn hàng -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <span class="me-2">Hiển thị:</span>
        <select
          v-model="itemsPerPage"
          class="form-select form-select-sm d-inline-block"
          style="width: auto"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="15">15</option>
          <option :value="20">20</option>
        </select>
        <span class="ms-2">đơn hàng mỗi trang</span>
      </div>
      <div>
        <span
          >Tổng số: <strong>{{ filteredOrders.length }}</strong> đơn hàng</span
        >
      </div>
    </div>

    <!-- Bảng Đơn Hàng -->
    <div class="table-responsive">
      <table class="order-table table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Mã Đơn</th>
            <th>Khách Hàng</th>
            <th>Tổng Tiền</th>
            <th>Trạng Thái</th>
            <th>Ngày Đặt</th>
            <th>Thanh Toán</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-if="paginatedOrders.length > 0"
            v-for="(order, index) in paginatedOrders"
            :key="order._id"
          >
            <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td>
              <span class="fw-bold">{{ order.orderCode }}</span>
            </td>
            <td>
              <div>{{ order.shippingInfo.fullName }}</div>
              <small class="text-muted">{{ order.shippingInfo.phone }}</small>
            </td>
            <td>{{ formatCurrency(order.totalPrice) }}</td>
            <td class="text-center">
              <span
                class="badge"
                :class="getStatusBadgeClass(order.status)"
                style="font-size: 0.9em; padding: 8px 12px"
              >
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td>
              <div>{{ formatDate(order.orderDate) }}</div>
              <small class="text-muted">{{
                formatTime(order.orderDate)
              }}</small>
            </td>
            <td class="text-center">
              <span
                class="badge"
                :class="
                  order.status === 'delivered' ? 'bg-success' : 'bg-warning'
                "
                style="font-size: 0.9em; padding: 8px 12px"
              >
                {{
                  order.status === "delivered"
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"
                }}
              </span>
            </td>
            <td class="text-center">
              <button
                class="btn btn-sm btn-outline-primary me-2"
                @click="viewOrderDetail(order)"
                title="Xem chi tiết"
              >
                <i class="fas fa-eye"></i>
              </button>
              <a
                :href="`https://5sao.ghn.dev/order/edit/${order.orderCode}`"
                target="_blank"
                class="btn btn-sm btn-outline-secondary"
                title="Chỉnh sửa đơn hàng"
              >
                <i class="fas fa-store"></i>
              </a>
            </td>
          </tr>
          <tr v-else>
            <td colspan="8" class="text-center text-muted">
              Không tìm thấy đơn hàng nào...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Phân trang -->
    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="changePage(currentPage - 1)">
            Trước
          </button>
        </li>
        <li
          class="page-item"
          v-for="page in totalPages"
          :key="page"
          :class="{ active: page === currentPage }"
        >
          <button class="page-link" @click="changePage(page)">
            {{ page }}
          </button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="changePage(currentPage + 1)">
            Tiếp theo
          </button>
        </li>
      </ul>
    </nav>

    <!-- Modal Chi tiết đơn hàng -->
    <div class="modal fade" id="orderDetailModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Chi tiết đơn hàng #{{ selectedOrder?.orderCode }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body" v-if="selectedOrder">
            <div class="row g-4">
              <!-- Thông tin đơn hàng -->
              <div class="col-md-6">
                <div class="order-info">
                  <h6 class="fw-bold mb-3">Thông tin đơn hàng</h6>
                  <p>
                    <strong>Ngày đặt:</strong>
                    {{ formatDate(selectedOrder.orderDate) }}
                    {{ formatTime(selectedOrder.orderDate) }}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>
                    <span
                      class="badge"
                      :class="getStatusBadgeClass(selectedOrder.status)"
                    >
                      {{ getStatusText(selectedOrder.status) }}
                    </span>
                  </p>
                  <p>
                    <strong>Tổng tiền:</strong>
                    {{ formatCurrency(selectedOrder.totalPrice) }}
                  </p>
                  <p>
                    <strong>Thanh toán:</strong>
                    <span
                      class="badge"
                      :class="
                        selectedOrder.status === 'delivered'
                          ? 'bg-success'
                          : 'bg-warning'
                      "
                    >
                      {{
                        selectedOrder.status === "delivered"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"
                      }}
                    </span>
                  </p>
                </div>
              </div>

              <!-- Thay đổi phần địa chỉ -->
              <div class="col-md-6">
                <div class="shipping-info">
                  <h6 class="fw-bold mb-3">Thông tin giao hàng</h6>
                  <p>
                    <strong>Họ tên:</strong>
                    {{ selectedOrder.shippingInfo.fullName }}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong>
                    {{ selectedOrder.shippingInfo.phone }}
                  </p>
                  <p>
                    <strong>Địa chỉ chi tiết:</strong>
                    {{ selectedOrder.shippingInfo.address }}
                  </p>
                  <p>
                    <strong>Địa chỉ hành chính:</strong>
                    {{ selectedOrder.shippingInfo.wardName }},
                    {{ selectedOrder.shippingInfo.districtName }},
                    {{ selectedOrder.shippingInfo.cityName }}
                  </p>
                </div>
              </div>

              <!-- Danh sách sản phẩm -->
              <div class="col-12">
                <div class="order-items">
                  <h6 class="fw-bold mb-3">Sản phẩm đã đặt</h6>
                  <div class="table-responsive">
                    <table class="table">
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th class="text-end">Giá</th>
                          <th class="text-center">SL</th>
                          <th class="text-end">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in selectedOrder.items" :key="item._id">
                          <td>
                            <div class="d-flex align-items-center">
                              <img
                                :src="
                                  item.productId.images?.[0] ||
                                  '/placeholder-image.jpg'
                                "
                                style="
                                  width: 50px;
                                  height: 50px;
                                  object-fit: cover;
                                "
                                class="me-2"
                              />
                              <div>
                                <div class="fw-bold">
                                  {{
                                    item.productId.name ||
                                    "Sản phẩm không còn tồn tại"
                                  }}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td class="text-end">
                            {{ formatCurrency(item.priceAtTime) }}
                          </td>
                          <td class="text-center">{{ item.quantity }}</td>
                          <td class="text-end">
                            {{
                              formatCurrency(item.priceAtTime * item.quantity)
                            }}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="3" class="text-end">
                            <strong>Tạm tính:</strong>
                          </td>
                          <td class="text-end">
                            <strong>{{
                              formatCurrency(
                                calculateSubtotal(selectedOrder.items)
                              )
                            }}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="3" class="text-end text-muted">
                            Phí vận chuyển:
                          </td>
                          <td class="text-end text-muted">
                            {{
                              formatCurrency(
                                selectedOrder.shippingFeeDetails.mainFee
                              )
                            }}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="3" class="text-end text-muted">
                            Giảm giá vận chuyển:
                          </td>
                          <td class="text-end text-muted">
                            -
                            {{
                              formatCurrency(
                                selectedOrder.shippingFeeDetails.discount
                              )
                            }}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="3" class="text-end">
                            <strong>Tổng cộng:</strong>
                          </td>
                          <td class="text-end">
                            <strong>{{
                              formatCurrency(selectedOrder.totalPrice)
                            }}</strong>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              v-if="selectedOrder && selectedOrder.status === 'pending'"
              type="button"
              class="btn btn-danger me-auto"
              @click="cancelOrder(selectedOrder._id)"
              :disabled="cancelLoading"
            >
              <i class="fas fa-ban me-1"></i>
              {{ cancelLoading ? "Đang hủy..." : "Hủy đơn hàng" }}
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
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import * as bootstrap from "bootstrap";
import { useAuthStore } from "../../store/AuthStore"; // Import AuthStore
// Thêm import SweetAlert2
import Swal from "sweetalert2";

export default {
  name: "OrderManager",
  setup() {
    // State
    const authStore = useAuthStore(); // Lấy store auth
    const orders = ref([]);
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const selectedOrder = ref(null);
    const loading = ref(false);
    const cancelLoading = ref(false);

    const error = ref(null);
    const filters = ref({
      orderCode: "",
      status: "",
      startDate: "",
      endDate: "",
    });

    // Fetch orders from API
    const fetchOrders = async () => {
      loading.value = true;
      try {
        const response = await axios.get(
          "http://localhost:3000/api/order/admin/orders"
        );
        orders.value = response.data.data.orders;
      } catch (err) {
        error.value =
          err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu";
        console.error("Error fetching orders:", err);
      } finally {
        loading.value = false;
      }
    };

    // Computed properties
    const filteredOrders = computed(() => {
      return orders.value.filter((order) => {
        const matchOrderCode = order.orderCode
          .toLowerCase()
          .includes(filters.value.orderCode.toLowerCase());
        const matchStatus =
          !filters.value.status || order.status === filters.value.status;

        let matchDate = true;
        if (filters.value.startDate && filters.value.endDate) {
          const orderDate = new Date(order.orderDate);
          const startDate = new Date(filters.value.startDate);
          const endDate = new Date(filters.value.endDate);
          matchDate = orderDate >= startDate && orderDate <= endDate;
        }

        return matchOrderCode && matchStatus && matchDate;
      });
    });

    // Thêm computed property để đếm số lượng đơn hàng đang ở trạng thái pending
    const pendingOrdersCount = computed(() => {
      return orders.value.filter((order) => order.status === "pending").length;
    });

    // Thêm computed cho totalPages
    const totalPages = computed(() => {
      return Math.ceil(filteredOrders.value.length / itemsPerPage.value);
    });

    // Sửa lại paginatedOrders để phân trang đúng
    const paginatedOrders = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredOrders.value.slice(start, end);
    });

    // Watch for filter changes and itemsPerPage changes
    watch(
      [filters, itemsPerPage],
      () => {
        currentPage.value = 1; // Reset to page 1 when filters or page size changes
      },
      { deep: true }
    );

    // Separate watch for page changes
    watch(currentPage, () => {
      // You can add code here if you need to do something when page changes
      // Like scrolling to top, etc.
    });

    // Mounted hook
    onMounted(() => {
      fetchOrders();
    });

    // Methods
    const formatCurrency = (value) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    };

    // Thêm hàm tính tổng giá trị sản phẩm
    const calculateSubtotal = (items) => {
      return items.reduce(
        (total, item) => total + item.priceAtTime * item.quantity,
        0
      );
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    };

    const formatTime = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString("vi-VN");
    };

    const getStatusText = (status) => {
      const statusMap = {
        pending: "Chờ xác nhận",
        processed: "Đã xác nhận",
        shipped: "Đang giao",
        delivered: "Đã giao",
        canceled: "Đã hủy",
        returned: "Đã trả hàng",
      };
      return statusMap[status] || status;
    };

    const getStatusBadgeClass = (status) => {
      const classMap = {
        pending: "bg-warning",
        processed: "bg-info",
        shipped: "bg-primary",
        delivered: "bg-success",
        canceled: "bg-danger",
        returned: "bg-secondary",
      };
      return classMap[status] || "bg-secondary";
    };

    const changePage = (page) => {
      currentPage.value = page;
    };

    const viewOrderDetail = (order) => {
      selectedOrder.value = order;
      const modal = new bootstrap.Modal(
        document.getElementById("orderDetailModal")
      );
      modal.show();
    };

    const exportToExcel = () => {
      // Implement export to Excel functionality
      alert("Tính năng xuất Excel đang được phát triển");
    };

    // Cancel order function
    const cancelOrder = async (orderId) => {
      // Tìm đơn hàng cần hủy để lấy orderCode
      const orderToCancel = orders.value.find((order) => order._id === orderId);
      if (!orderToCancel) return;

      // Sử dụng SweetAlert2 để xác nhận trước khi hủy
      const result = await Swal.fire({
        title: "Xác nhận hủy đơn hàng",
        text: `Bạn có chắc chắn muốn hủy đơn hàng ${orderToCancel.orderCode}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Đồng ý, hủy đơn!",
        cancelButtonText: "Không, giữ lại",
      });

      if (!result.isConfirmed) return;

      cancelLoading.value = true;
      try {
        // Gọi API với endpoint và header mới
        await axios.post(
          `http://localhost:3000/api/order/admin/cancel/${orderToCancel.orderCode}`,
          {}, // body rỗng nếu không cần gửi dữ liệu
          {
            headers: {
              "Content-Type": "application/json",
              token: import.meta.env.VITE_GHN_API_TOKEN_DEV,
              shopId: import.meta.env.VITE_GHN_SHOP_ID_DEV,
            },
          }
        );

        // Cập nhật trạng thái đơn hàng trong danh sách
        const index = orders.value.findIndex((order) => order._id === orderId);
        if (index !== -1) {
          orders.value[index].status = "canceled";
        }

        // Cập nhật đơn hàng đang được xem nếu trùng với đơn hàng bị hủy
        if (selectedOrder.value && selectedOrder.value._id === orderId) {
          selectedOrder.value.status = "canceled";
        }

        // Thông báo thành công với SweetAlert2
        await Swal.fire({
          title: "Thành công!",
          text: "Đơn hàng đã được hủy thành công",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      } catch (err) {
        // Hiển thị lỗi với SweetAlert2
        await Swal.fire({
          title: "Lỗi!",
          text: err.response?.data?.message || "Có lỗi xảy ra khi hủy đơn hàng",
          icon: "error",
          confirmButtonColor: "#3085d6",
        });
        console.error("Error canceling order:", err);
      } finally {
        cancelLoading.value = false;
      }
    };

    return {
      orders,
      currentPage,
      itemsPerPage,
      filters,
      selectedOrder,
      loading,
      error,
      paginatedOrders,
      filteredOrders, // Make sure filteredOrders is returned for the template
      formatCurrency,
      formatDate,
      formatTime,
      getStatusText,
      getStatusBadgeClass,
      changePage,
      viewOrderDetail,
      exportToExcel,
      totalPages, // Đảm bảo export totalPages
      cancelOrder,
      cancelLoading,
      pendingOrdersCount, // Đảm bảo export pendingOrdersCount
      calculateSubtotal, // Đảm bảo export function calculateSubtotal
    };
  },
};
</script>

<style scoped>
.order-table th {
  background-color: #f8f9fa;
  white-space: nowrap;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

.card {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

.table-responsive {
  overflow-x: auto;
}

.order-table td {
  vertical-align: middle;
}

/* Modal styles */
.modal-lg {
  max-width: 800px;
}

.order-info,
.shipping-info,
.order-items {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.table img {
  border-radius: 4px;
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
