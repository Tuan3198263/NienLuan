<template>
  <div class="bg-white p-4 rounded shadow-sm mb-4">
    <div
      class="d-flex justify-content-between align-items-center section-header"
    >
      <div class="d-flex align-items-center">
        <i class="fas fa-wallet fa-lg text-muted section-icon"></i>
        <span class="section-title">PHƯƠNG THỨC THANH TOÁN</span>
      </div>
      <i class="fas fa-edit edit-icon"></i>
    </div>
    <div class="mt-3">
      <div class="form-check">
        <input
          class="form-check-input"
          type="radio"
          id="cod"
          value="cod"
          v-model="selectedPayment"
        />
        <label class="form-check-label" for="cod">
          Thanh toán khi nhận hàng (COD)
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "PaymentMethod",
  setup() {
    const selectedPayment = ref("cod"); // Mặc định là COD

    return { selectedPayment };
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
.form-check {
  margin-top: 10px;
}
</style>
