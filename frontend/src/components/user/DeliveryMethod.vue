<template>
  <div class="bg-white p-4 rounded shadow-sm mb-4">
    <div
      class="d-flex justify-content-between align-items-center section-header"
    >
      <div class="d-flex align-items-center">
        <i class="fas fa-truck fa-lg text-muted section-icon"></i>
        <span class="section-title">GIAO HÀNG NHANH</span>
      </div>
      <i class="fas fa-edit edit-icon"></i>
    </div>
    <p v-if="estimatedDate" class="text-muted fw-bold mt-2">
      Dự kiến: {{ estimatedDate }}
    </p>
    <p v-else class="text-muted mt-2">Đang tính thời gian giao hàng...</p>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import axios from "axios";

export default {
  name: "DeliveryMethod",
  props: {
    shippingAddress: { type: Object, required: true, default: () => ({}) },
  },
  setup(props) {
    const estimatedDate = ref(null);

    const fetchLeadtime = async () => {
      if (
        !props.shippingAddress.to_district_id ||
        !props.shippingAddress.to_ward_code
      ) {
        estimatedDate.value = "Chưa có thông tin địa chỉ.";
        return;
      }

      try {
        const response = await axios.post(
          "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime",
          {
            to_district_id: parseInt(props.shippingAddress.to_district_id, 10),
            to_ward_code: props.shippingAddress.to_ward_code,
            service_id: 53320, // ID dịch vụ vận chuyển
          },
          {
            headers: {
              Token: import.meta.env.VITE_GHN_API_TOKEN,
              ShopId: import.meta.env.VITE_GHN_SHOP_ID,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.code === 200) {
          const leadtime = response.data.data.leadtime;
          const deliveryDate = new Date(leadtime * 1000);
          estimatedDate.value = deliveryDate.toLocaleDateString("vi-VN");
        } else {
          estimatedDate.value = "Không thể tính thời gian giao hàng.";
        }
      } catch (error) {
        console.error("Lỗi khi gọi API Leadtime:", error);
        estimatedDate.value = "Lỗi khi tính toán.";
      }
    };

    onMounted(fetchLeadtime);
    watch(() => props.shippingAddress, fetchLeadtime, { deep: true });

    return { estimatedDate };
  },
};
</script>

<style scoped>
.section-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-icon {
  margin-right: 12px !important;
}
</style>
