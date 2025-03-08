<template>
  <div class="bg-white p-4 rounded-lg shadow-md">
    <h2 class="h4 font-weight-bold mb-4">Địa chỉ nhận hàng</h2>

    <!-- Phần hiển thị thông tin địa chỉ hiện có -->
    <div class="bg-light p-4 rounded mb-4">
      <h4 class="font-weight-bold">Thông tin địa chỉ hiện tại</h4>
      <div v-if="addressData">
        <p><strong>Họ và tên:</strong> {{ addressData.fullName }}</p>
        <p><strong>Số điện thoại:</strong> {{ addressData.phone }}</p>
        <p><strong>Địa chỉ:</strong> {{ addressData.address }}</p>
        <p class="text-secondary fw-bold">
          {{ addressData.wardName }}, {{ addressData.districtName }},
          {{ addressData.cityName }}
        </p>
      </div>
      <div v-else>
        <p class="text-danger">
          Chưa có địa chỉ, vui lòng cập nhật thông tin địa chỉ mới.
        </p>
      </div>
    </div>

    <!-- Phần form nhập địa chỉ mới (luôn hiển thị, các trường luôn trống) -->
    <div class="bg-light p-4 rounded">
      <h4 class="font-weight-bold">Cập nhật địa chỉ mới</h4>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Họ và tên người nhận</label>
          <input
            v-model="address.fullName"
            class="form-control"
            type="text"
            required
            placeholder="Nhập họ và tên"
          />
        </div>
        <div class="col-md-6">
          <label class="form-label">Số điện thoại</label>
          <input
            v-model="address.phone"
            class="form-control"
            type="text"
            required
            placeholder="Nhập số điện thoại"
          />
        </div>
        <div class="col-md-12">
          <label class="form-label">Địa chỉ nhận hàng</label>
          <input
            v-model="address.address"
            class="form-control"
            type="text"
            required
            placeholder="Nhập địa chỉ"
          />
        </div>
        <!-- Các trường chọn Thành phố, Quận/Huyện, Phường/Xã -->
        <div class="col-md-6">
          <label class="form-label">Thành phố</label>
          <v-select
            v-model="address.city"
            :options="cities"
            label="ProvinceName"
            :reduce="(city) => city.ProvinceID"
            class="custom-select"
            @update:modelValue="fetchDistricts"
            required
          />
        </div>
        <div class="col-md-6">
          <label class="form-label">Quận/Huyện</label>
          <v-select
            v-model="address.district"
            :options="districts"
            label="DistrictName"
            :reduce="(district) => district.DistrictID"
            class="custom-select"
            :disabled="!address.city"
            @update:modelValue="fetchWards"
            required
          />
        </div>
        <div class="col-md-6">
          <label class="form-label">Phường/Xã</label>
          <v-select
            v-model="address.ward"
            :options="wards"
            label="WardName"
            :reduce="(ward) => ward.WardCode"
            class="custom-select"
            :disabled="!address.district"
            required
          />
        </div>
      </div>
      <div class="d-flex justify-content-end">
        <button class="btn btn-success mt-4" @click="saveAddress">
          Lưu thay đổi
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import { useAuthStore } from "../../store/AuthStore"; // Import store Pinia
import Swal from "sweetalert2"; // Import SweetAlert2
import { useToast } from "vue-toastification"; // Import Vue Toastification

// Khởi tạo store
const authStore = useAuthStore();
const toast = useToast(); // Khởi tạo Toast

// Dữ liệu cho form nhập địa chỉ (luôn tách riêng, không được prefill từ addressData)
const address = ref({
  fullName: "",
  phone: "",
  address: "",
  city: "",
  district: "",
  ward: "",
  cityName: "",
  districtName: "",
  wardName: "",
});

// Dữ liệu hiển thị thông tin địa chỉ đã lưu (nếu có)
const addressData = ref(null);

const cities = ref([]);
const districts = ref([]);
const wards = ref([]);

// Lấy API_TOKEN từ môi trường (cho các API bên ngoài, ví dụ GHN)
const API_TOKEN = import.meta.env.VITE_GHN_API_TOKEN;

onMounted(async () => {
  try {
    // Lấy danh sách tỉnh/thành phố từ GHN
    const response = await axios.get(
      "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
      { headers: { token: API_TOKEN, "Content-Type": "application/json" } }
    );
    if (response.data.code === 200) {
      cities.value = response.data.data;
    }

    // Lấy thông tin địa chỉ của người dùng từ API backend
    const token = authStore.token;
    const addressResponse = await axios.get(
      "http://localhost:3000/api/shipping-address/",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (addressResponse.data.success) {
      addressData.value = addressResponse.data.data;
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
  }
});

const fetchDistricts = async () => {
  if (!address.value.city) {
    districts.value = [];
    return;
  }
  try {
    const response = await axios.post(
      "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
      { province_id: address.value.city },
      { headers: { token: API_TOKEN, "Content-Type": "application/json" } }
    );
    if (response.data.code === 200) {
      districts.value = response.data.data;
    }
  } catch (error) {
    console.error("Lỗi khi tải danh sách quận/huyện:", error);
  }
};

const fetchWards = async () => {
  if (!address.value.district) {
    wards.value = [];
    return;
  }
  try {
    const response = await axios.post(
      "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
      { district_id: address.value.district },
      { headers: { token: API_TOKEN, "Content-Type": "application/json" } }
    );
    if (response.data.code === 200) {
      wards.value = response.data.data;
    }
  } catch (error) {
    console.error("Lỗi khi tải danh sách phường/xã:", error);
  }
};

const saveAddress = async () => {
  // Kiểm tra xem tất cả các trường đã được nhập chưa
  if (
    !address.value.fullName ||
    !address.value.phone ||
    !address.value.address ||
    !address.value.city ||
    !address.value.district ||
    !address.value.ward
  ) {
    toast.error("Vui lòng nhập đầy đủ thông tin");
    return; // Dừng submit nếu có trường chưa được điền
  }

  // Kiểm tra họ và tên: không chứa số, ký tự đặc biệt, tối đa 50 ký tự
  const nameRegex = /^[A-Za-zÀ-Ỹà-ỹ\s]{1,50}$/;
  if (!nameRegex.test(address.value.fullName.trim())) {
    toast.error(
      "Tên không hợp lệ. Chỉ chứa chữ cái và khoảng trắng, tối đa 50 ký tự."
    );
    return false;
  }

  // Kiểm tra số điện thoại hợp lệ
  const phoneRegex = /^(0[2-9]\d{8})$/;
  if (!phoneRegex.test(address.value.phone.trim())) {
    toast.error("Số điện thoại không hợp lệ");
    return;
  }

  // Kiểm tra độ dài địa chỉ (không quá 100 ký tự)
  if (address.value.address.trim().length > 100) {
    toast.error("Địa chỉ không được vượt quá 100 ký tự.");
    return;
  }

  // Lưu tên của các trường (cityName, districtName, wardName)
  address.value.cityName =
    cities.value.find((city) => city.ProvinceID === address.value.city)
      ?.ProvinceName || "";
  address.value.districtName =
    districts.value.find(
      (district) => district.DistrictID === address.value.district
    )?.DistrictName || "";
  address.value.wardName =
    wards.value.find((ward) => ward.WardCode === address.value.ward)
      ?.WardName || "";

  // Hiển thị SweetAlert2 xác nhận trước khi gửi
  const result = await Swal.fire({
    title: "Xác nhận lưu địa chỉ?",
    text: "Bạn có chắc chắn muốn lưu địa chỉ này?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
  });

  if (result.isConfirmed) {
    try {
      const token = authStore.token;
      // Gửi yêu cầu PUT để cập nhật địa chỉ
      const response = await axios.put(
        "http://localhost:3000/api/shipping-address/update",
        address.value,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Địa chỉ đã được lưu thành công");
        // Cập nhật lại thông tin hiển thị sau khi lưu
        addressData.value = response.data.data;
      } else {
        toast.error("Có lỗi xảy ra khi lưu địa chỉ");
      }
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      toast.error("Lỗi khi lưu địa chỉ. Vui lòng thử lại");
    }
  }
};
</script>

<style scoped>
.rounded-lg {
  border-radius: 10px;
}

.shadow-md {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.text-danger {
  color: #dc3545;
}
/* Tránh chữ bị kéo dài ra ngoài */
.bg-light p {
  word-wrap: break-word; /* Chia từ khi cần thiết */
  overflow: hidden; /* Ẩn phần vượt quá */
  text-overflow: ellipsis; /* Hiển thị dấu ba chấm khi văn bản quá dài */
}

.custom-select {
  width: 100%;
}
/* Tùy chỉnh dropdown menu */
:deep(.vs__dropdown-menu) {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Tùy chỉnh hover state */
:deep(.vs__dropdown-option--highlight) {
  background: #f1f5f9;
  color: #1e293b;
}

/* Tùy chỉnh input field */
:deep(.vs__search) {
  border-radius: 6px;
}

/* Tùy chỉnh border khi focus */
:deep(.vs__dropdown-toggle) {
  border-radius: 6px;
  transition: border-color 0.2s;
}

:deep(.vs--open .vs__dropdown-toggle) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}
</style>
