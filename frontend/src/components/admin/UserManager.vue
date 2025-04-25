<template>
  <div class="">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold">Quản Lý Người Dùng</h4>
      <div class="statistics">
        <span class="badge bg-info fs-6">
          <i class="fas fa-users me-1"></i> Tổng số: {{ users.length }} người
          dùng
        </span>
      </div>
    </div>

    <!-- Bộ lọc tìm kiếm -->
    <div class="card p-3 mb-4">
      <div class="row g-3">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-search"></i></span>
            <input
              v-model="filters.name"
              type="text"
              class="form-control"
              placeholder="Tìm theo tên người dùng"
            />
          </div>
        </div>
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text"
              ><i class="fas fa-envelope"></i
            ></span>
            <input
              v-model="filters.email"
              type="text"
              class="form-control"
              placeholder="Tìm theo email"
            />
          </div>
        </div>
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-phone"></i></span>
            <input
              v-model="filters.phone"
              type="text"
              class="form-control"
              placeholder="Tìm theo số điện thoại"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Hiển thị thông tin về số người dùng và pagination -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="items-per-page">
        <span class="me-2">Hiển thị:</span>
        <select
          v-model="itemsPerPage"
          class="form-select form-select-sm d-inline-block"
          style="width: auto"
          @change="handleItemsPerPageChange"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
        <span class="ms-2">người dùng mỗi trang</span>
      </div>

      <div class="pagination-info">
        <span class="text-muted">
          Hiển thị {{ startItem }} - {{ endItem }} trong tổng số
          {{ filteredUserCount }} người dùng
        </span>
      </div>
    </div>

    <!-- Bảng Người Dùng -->
    <table class="user-table table table-bordered">
      <thead>
        <tr>
          <th>#</th>
          <th>Tên Người Dùng</th>
          <th>Email</th>
          <th>Số Điện Thoại</th>
          <th>Mật khẩu</th>
          <th>Trạng Thái</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-if="paginatedUsers.length > 0"
          v-for="(user, index) in paginatedUsers"
          :key="user._id"
        >
          <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
          <td>{{ user.fullName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phone }}</td>
          <td>{{ user.password }}</td>
          <td class="text-center">
            <button
              :class="['btn', user.ban ? 'btn-danger' : 'btn-success']"
              style="min-width: 100px"
              @click="toggleBanStatus(user)"
            >
              {{ user.ban ? "Bị cấm" : "Hoạt động" }}
            </button>
          </td>

          <td class="text-center">
            <button
              class="btn btn-sm btn-outline-info me-2"
              @click="viewUserDetails(user)"
              title="Xem chi tiết"
            >
              <i class="fas fa-eye"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-dark me-2"
              @click="openEditUserModal(user)"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              @click="deleteUser(user)"
              disabled
              title="Tính năng xóa đã bị vô hiệu hóa để tránh xóa nhầm"
              style="opacity: 0.6; cursor: not-allowed"
            >
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
        <tr v-else>
          <td colspan="7" class="text-center text-muted">
            Không tìm thấy người dùng...
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Edit User Modal -->
    <div
      class="modal fade"
      id="editUserModal"
      tabindex="-1"
      aria-labelledby="editUserModalLabel"
      aria-hidden="true"
      ref="editUserModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editUserModalLabel">
              Chỉnh sửa Người Dùng
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateUser">
              <div class="mb-3">
                <label for="editUserName" class="form-label"
                  >Tên Người Dùng</label
                >
                <input
                  type="text"
                  id="editUserName"
                  v-model="selectedUser.fullName"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="editUserEmail" class="form-label">Email</label>
                <input
                  type="email"
                  id="editUserEmail"
                  v-model="selectedUser.email"
                  class="form-control"
                  disabled
                  required
                />
              </div>
              <div class="mb-3">
                <label for="editUserPhone" class="form-label"
                  >Số Điện Thoại</label
                >
                <input
                  type="text"
                  id="editUserPhone"
                  v-model="selectedUser.phone"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="editUserPassword" class="form-label"
                  >Mật khẩu</label
                >
                <input
                  id="editUserPassword"
                  v-model="selectedUser.password"
                  class="form-control"
                />
              </div>
              <!-- Thêm trường Địa chỉ -->
              <div class="mb-3">
                <label for="editUserAddress" class="form-label">Địa chỉ</label>
                <input
                  type="text"
                  id="editUserAddress"
                  v-model="selectedUser.address"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="editUserStatus" class="form-label"
                  >Trạng Thái</label
                >
                <select
                  id="editUserStatus"
                  v-model="selectedUser.ban"
                  class="form-select"
                  required
                >
                  <option value="false">Hoạt động</option>
                  <option value="true">Bị cấm</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="submit"
              class="btn btn-success"
              @click="updateUser"
              data-bs-dismiss="modal"
            >
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
        </div>
      </div>
    </div>

    <!-- Chi tiết người dùng Modal -->
    <div
      class="modal fade"
      id="userDetailsModal"
      tabindex="-1"
      aria-labelledby="userDetailsModalLabel"
      aria-hidden="true"
      ref="userDetailsModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="userDetailsModalLabel">
              Chi tiết người dùng: {{ selectedUser.fullName }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="user-details">
              <!-- Thông tin cơ bản -->
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">Thông tin cơ bản</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-4 mb-2">
                      <strong>Họ tên:</strong> {{ selectedUser.fullName }}
                    </div>
                    <div class="col-md-4 mb-2">
                      <strong>Email:</strong> {{ selectedUser.email }}
                    </div>
                    <div class="col-md-4 mb-2">
                      <strong>Số điện thoại:</strong> {{ selectedUser.phone }}
                    </div>
                    <div class="col-md-4 mb-2">
                      <strong>Vai trò:</strong>
                      {{
                        selectedUser.role === "admin"
                          ? "Quản trị viên"
                          : "Người dùng"
                      }}
                    </div>
                    <div class="col-md-4 mb-2">
                      <strong>Trạng thái:</strong>
                      <span
                        :class="
                          selectedUser.ban ? 'text-danger' : 'text-success'
                        "
                      >
                        {{ selectedUser.ban ? "Bị cấm" : "Hoạt động" }}
                      </span>
                    </div>
                    <div class="col-md-4 mb-2">
                      <strong>Ngày tạo:</strong>
                      {{ formatDate(selectedUser.createdAt) }}
                    </div>
                  </div>
                  <div v-if="selectedUser.avatar" class="mt-2 text-center">
                    <img
                      :src="selectedUser.avatar"
                      alt="Avatar"
                      class="img-thumbnail"
                      style="max-width: 150px"
                    />
                  </div>
                </div>
              </div>

              <!-- Địa chỉ nhận hàng -->
              <div
                v-if="
                  selectedUser.shippingAddresses &&
                  selectedUser.shippingAddresses.length > 0
                "
                class="card mb-3"
              >
                <div class="card-header bg-light">
                  <h6 class="mb-0">
                    Địa chỉ nhận hàng ({{
                      selectedUser.shippingAddresses.length
                    }})
                  </h6>
                </div>
                <div class="card-body">
                  <div
                    v-for="(address, index) in selectedUser.shippingAddresses"
                    :key="address._id"
                    class="mb-2 p-2 border-bottom"
                  >
                    <div>
                      <strong>{{ index + 1 }}. {{ address.fullName }}</strong>
                      {{ address.isDefault ? "(Mặc định)" : "" }}
                    </div>
                    <div>{{ address.phone }}</div>
                    <div>
                      {{ address.address }}, {{ address.wardName }},
                      {{ address.districtName }}, {{ address.cityName }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Thống kê đơn hàng -->
              <div v-if="selectedUser.orderStats" class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">Thống kê đơn hàng</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-4 mb-2">
                      <strong>Tổng đơn hàng:</strong>
                      {{ selectedUser.orderStats.totalOrders }}
                    </div>
                    <div class="col-md-4 mb-2">
                      <strong>Đơn chờ xác nhận:</strong>
                      {{ selectedUser.orderStats.pendingOrders }}
                    </div>
                    <div class="col-md-4 mb-2">
                      <strong>Đơn đã xác nhận:</strong>
                      {{ selectedUser.orderStats.processedOrders }}
                    </div>
                    <div class="col-md-4 mb-2">
                      <strong>Đơn đang giao:</strong>
                      {{ selectedUser.orderStats.shippedOrders }}
                    </div>
                    <div class="col-md-4 mb-2">
                      <strong>Đơn đã giao:</strong>
                      {{ selectedUser.orderStats.deliveredOrders }}
                    </div>
                    <div class="col-md-4 mb-2">
                      <strong>Đơn đã hủy:</strong>
                      {{ selectedUser.orderStats.canceledOrders }}
                    </div>
                    <div class="col-md-4 mb-2">
                      <strong>Đơn đã trả:</strong>
                      {{ selectedUser.orderStats.returnedOrders }}
                    </div>
                    <div class="col-md-8 mb-2">
                      <strong>Tổng chi tiêu:</strong>
                      {{ formatCurrency(selectedUser.orderStats.totalSpent) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Thống kê đánh giá -->
              <div v-if="selectedUser.reviewStats" class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">
                    Thống kê đánh giá ({{
                      selectedUser.reviewStats.totalReviews
                    }})
                  </h6>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <strong>Tổng số đánh giá:</strong>
                    {{ selectedUser.reviewStats.totalReviews }}
                    <span v-if="selectedUser.reviewStats.totalReviews > 0">
                      (Điểm trung bình:
                      <strong>{{
                        selectedUser.reviewStats.averageRating
                      }}</strong
                      >/5)
                    </span>
                  </div>

                  <div
                    v-if="
                      selectedUser.reviewStats.reviewedProducts &&
                      selectedUser.reviewStats.reviewedProducts.length > 0
                    "
                  >
                    <h6>Các sản phẩm đã đánh giá:</h6>
                    <div class="table-responsive">
                      <table class="table table-sm table-striped">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Sản phẩm</th>
                            <th>Đánh giá</th>
                            <th>Bình luận</th>
                            <th>Ngày đánh giá</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(review, index) in selectedUser.reviewStats
                              .reviewedProducts"
                            :key="index"
                          >
                            <td>{{ index + 1 }}</td>
                            <td>{{ review.productName }}</td>
                            <td>
                              <div class="rating">
                                <i
                                  v-for="star in 5"
                                  :key="star"
                                  :class="[
                                    'fas',
                                    'fa-star',
                                    star <= review.rating
                                      ? 'text-warning'
                                      : 'text-secondary',
                                  ]"
                                ></i>
                              </div>
                            </td>
                            <td>{{ review.comment }}</td>
                            <td>{{ formatDate(review.createdAt) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
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

    <!-- Phân trang -->
    <div class="d-flex justify-content-between align-items-center">
      <div class="pagination-stats">
        <span class="text-muted">Trang {{ currentPage }}/{{ totalPages }}</span>
      </div>

      <nav>
        <ul class="pagination justify-content-center">
          <li
            class="page-item"
            :class="{ disabled: currentPage === 1 }"
            @click="changePage(currentPage - 1)"
          >
            <a class="page-link" href="#"> Trước</a>
          </li>
          <li
            class="page-item"
            v-for="page in displayedPages"
            :key="page"
            :class="{ active: page === currentPage }"
            @click="changePage(page)"
          >
            <a class="page-link" href="#">{{ page }}</a>
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages }"
            @click="changePage(currentPage + 1)"
          >
            <a class="page-link" href="#">Tiếp theo</a>
          </li>
        </ul>
      </nav>

      <div style="width: 100px"><!-- Để giữ cân bằng layout --></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import * as bootstrap from "bootstrap";

export default {
  setup() {
    const filters = ref({
      name: "",
      email: "",
      phone: "",
    });
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const users = ref([]);
    const selectedUser = ref({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      ban: false,
    });
    // Khai báo ref cho modal
    const editUserModal = ref(null);
    const userDetailsModal = ref(null);

    // Lấy dữ liệu người dùng từ API
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/auth/get-users"
        );

        // Cập nhật để phù hợp với response mới
        users.value = response.data.users;

        totalPages.value = Math.ceil(users.value.length / itemsPerPage.value);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
      }
    };

    // Xem chi tiết người dùng
    const viewUserDetails = (user) => {
      selectedUser.value = { ...user };

      // Khởi tạo modal chi tiết người dùng
      const modal = new bootstrap.Modal(userDetailsModal.value);
      modal.show();
    };

    // Format tiền tệ
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(amount);
    };

    // Format ngày tháng
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    };

    // Tính toán số người dùng đã lọc
    const filteredUsers = computed(() => {
      let result = users.value;

      if (filters.value.name) {
        result = result.filter((user) =>
          user.fullName.toLowerCase().includes(filters.value.name.toLowerCase())
        );
      }

      if (filters.value.email) {
        result = result.filter((user) =>
          user.email.toLowerCase().includes(filters.value.email.toLowerCase())
        );
      }

      if (filters.value.phone) {
        result = result.filter((user) =>
          user.phone.toLowerCase().includes(filters.value.phone.toLowerCase())
        );
      }

      return result;
    });

    // Tính số lượng người dùng đã lọc
    const filteredUserCount = computed(() => {
      return filteredUsers.value.length;
    });

    // Tính toán danh sách người dùng trên trang hiện tại
    const paginatedUsers = computed(() => {
      return filteredUsers.value.slice(
        (currentPage.value - 1) * itemsPerPage.value,
        currentPage.value * itemsPerPage.value
      );
    });

    // Tính toán tổng số trang dựa trên số lượng người dùng đã lọc
    const totalPages = computed(() => {
      return Math.ceil(filteredUserCount.value / itemsPerPage.value) || 1;
    });

    // Tính toán chỉ mục bắt đầu và kết thúc của người dùng trên trang hiện tại
    const startItem = computed(() => {
      if (filteredUserCount.value === 0) return 0;
      return (currentPage.value - 1) * itemsPerPage.value + 1;
    });

    const endItem = computed(() => {
      return Math.min(
        currentPage.value * itemsPerPage.value,
        filteredUserCount.value
      );
    });

    // Tính toán các trang hiển thị trong phân trang (tối đa 5 trang)
    const displayedPages = computed(() => {
      let pages = [];
      const maxPagesToShow = 5;

      if (totalPages.value <= maxPagesToShow) {
        // Hiển thị tất cả các trang nếu tổng số trang <= 5
        for (let i = 1; i <= totalPages.value; i++) {
          pages.push(i);
        }
      } else {
        // Luôn hiển thị trang hiện tại ở giữa nếu có thể
        let startPage = Math.max(
          1,
          currentPage.value - Math.floor(maxPagesToShow / 2)
        );
        let endPage = Math.min(
          totalPages.value,
          startPage + maxPagesToShow - 1
        );

        // Điều chỉnh lại nếu endPage đạt đến totalPages
        if (endPage === totalPages.value) {
          startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
      }

      return pages;
    });

    // Chuyển trang
    const changePage = (page) => {
      if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    // Xử lý thay đổi số lượng items hiển thị trên mỗi trang
    const handleItemsPerPageChange = () => {
      // Reset về trang 1 khi thay đổi số lượng items hiển thị
      currentPage.value = 1;
    };

    const openEditUserModal = (user) => {
      selectedUser.value = { ...user };

      // Khởi tạo modal với ref
      const modal = new bootstrap.Modal(editUserModal.value);
      modal.show();
    };

    // Hàm đóng modal chỉnh sửa người dùng
    const closeEditUserModal = () => {};

    // Hàm cập nhật người dùng
    // Hàm cập nhật người dùng với xác nhận trước khi submit
    const updateUser = async () => {
      const result = await Swal.fire({
        title: "Xác nhận thay đổi?",
        text: "Bạn chắc chắn muốn lưu thay đổi này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Lưu thay đổi",
        cancelButtonText: "Hủy bỏ",
      });

      if (result.isConfirmed) {
        try {
          await axios.put(
            `http://localhost:3000/api/auth/admin/update-user/${selectedUser.value._id}`,
            selectedUser.value
          );
          Swal.fire("Thành công!", "Người dùng đã được cập nhật.", "success");
          closeEditUserModal();
          fetchUsers(); // Lấy lại dữ liệu người dùng
        } catch (error) {
          console.error("Lỗi khi cập nhật người dùng:", error);
          Swal.fire("Lỗi!", "Có lỗi xảy ra khi cập nhật người dùng.", "error");
        }
      }
    };

    const deleteUser = async (user) => {
      const result = await Swal.fire({
        title: "Xác nhận xóa?",
        text: "Bạn có chắc chắn muốn xóa người dùng này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy bỏ",
      });

      if (result.isConfirmed) {
        try {
          await axios.delete(
            `http://localhost:3000/api/auth/admin/delete-user/${user._id}`
          );
          Swal.fire("Đã xóa!", "Người dùng đã được xóa thành công.", "success");
          fetchUsers(); // Làm mới danh sách sau khi xóa
        } catch (error) {
          console.error("Lỗi khi xóa người dùng:", error);
          Swal.fire("Lỗi!", "Có lỗi xảy ra khi xóa người dùng.", "error");
        }
      }
    };

    // Hàm thay đổi trạng thái ban
    const toggleBanStatus = (user) => {
      user.ban = !user.ban;
      // logic cập nhật trạng thái người dùng
    };

    // Lấy dữ liệu người dùng khi component được mount
    onMounted(fetchUsers);

    return {
      filters,
      currentPage,
      itemsPerPage,
      users,
      selectedUser,
      paginatedUsers,
      filteredUserCount,
      startItem,
      endItem,
      totalPages,
      displayedPages,
      changePage,
      handleItemsPerPageChange,
      openEditUserModal,
      closeEditUserModal,
      updateUser,
      deleteUser,
      toggleBanStatus,
      editUserModal,
      userDetailsModal,
      viewUserDetails,
      formatCurrency,
      formatDate,
    };
  },
};
</script>

<style scoped>
/* CSS tùy chỉnh cho trang quản lý người dùng */
.modal-body {
  max-height: 70vh; /* Tăng chiều cao để hiển thị nhiều thông tin hơn */
  overflow-y: auto;
}

.user-table th {
  background-color: #f8f9fa;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

.user-table th,
.user-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
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
  display: inline-block;
}

.pagination .page-item.disabled .page-link {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.6;
}

.pagination .page-item.active .page-link {
  background-color: #007bff;
  color: white;
}

.pagination .page-link:hover {
  background-color: #0056b3;
  color: white;
  text-decoration: none;
}

button.page-link {
  border: none;
  width: 100%;
}

.rating .fas.fa-star.text-warning {
  color: #ffc107;
}

.rating .fas.fa-star.text-secondary {
  color: #ddd;
}

.user-details .card-header {
  font-weight: bold;
  background-color: #f8f9fa;
}

.badge.bg-info {
  background-color: #0dcaf0 !important;
}

.pagination-info,
.pagination-stats {
  color: #6c757d;
  font-size: 0.9rem;
}

.items-per-page {
  font-size: 0.9rem;
}

.items-per-page select {
  display: inline-block;
  width: auto;
  margin: 0 5px;
}
</style>
