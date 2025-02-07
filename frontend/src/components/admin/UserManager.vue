<template>
  <div class="mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold">Quản Lý Người Dùng</h4>
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
              {{ user.ban ? "Bị cấm" : "Kích hoạt" }}
            </button>
          </td>

          <td class="text-center">
            <button
              class="btn btn-sm btn-outline-dark me-2"
              @click="openEditUserModal(user)"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              @click="deleteUser(user)"
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
                  <option value="false">Kích hoạt</option>
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

    <!-- Phân trang -->
    <nav>
      <ul class="pagination justify-content-center">
        <li
          class="page-item"
          :class="{ disabled: currentPage === 1 }"
          @click="changePage(currentPage - 1)"
        >
          <a class="page-link" href="#">Trước</a>
        </li>
        <li
          class="page-item"
          v-for="page in totalPages"
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
    const itemsPerPage = ref(5);
    const totalPages = ref(1);
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

    // Lấy dữ liệu người dùng từ API
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/auth/get-users"
        );
        users.value = response.data.users;
        totalPages.value = Math.ceil(users.value.length / itemsPerPage.value);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
      }
    };

    // Tính toán danh sách người dùng sau khi lọc
    const paginatedUsers = computed(() => {
      let filteredUsers = users.value;

      if (filters.value.name) {
        filteredUsers = filteredUsers.filter((user) =>
          user.fullName.toLowerCase().includes(filters.value.name.toLowerCase())
        );
      }

      if (filters.value.email) {
        filteredUsers = filteredUsers.filter((user) =>
          user.email.toLowerCase().includes(filters.value.email.toLowerCase())
        );
      }

      if (filters.value.phone) {
        filteredUsers = filteredUsers.filter((user) =>
          user.phone.toLowerCase().includes(filters.value.phone.toLowerCase())
        );
      }

      return filteredUsers.slice(
        (currentPage.value - 1) * itemsPerPage.value,
        currentPage.value * itemsPerPage.value
      );
    });

    // Chuyển trang
    const changePage = (page) => {
      if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
      }
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
      totalPages,
      users,
      selectedUser,
      paginatedUsers,
      changePage,
      openEditUserModal,
      closeEditUserModal,
      updateUser,
      deleteUser,
      toggleBanStatus,
      editUserModal,
    };
  },
};
</script>

<style scoped>
/* CSS tùy chỉnh cho trang quản lý người dùng */
.modal-body {
  max-height: 60vh; /* Giới hạn chiều cao tối đa của modal body, có thể điều chỉnh theo ý bạn */
  overflow-y: auto; /* Hiển thị thanh cuộn dọc nếu nội dung vượt quá chiều cao */
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
