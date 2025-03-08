<template>
  <div>
    <!-- Thêm div bao bọc toàn bộ nội dung -->
    <div class="container mt-5"><Breadcum></Breadcum></div>

    <div>
      <OrderDetails :orderCode="orderCode"></OrderDetails>
    </div>
  </div>
</template>

<script>
import OrderDetails from "../../components/user/OrderDetails.vue";
import Breadcum from "../../components/user/Breadcrumb.vue";

export default {
  name: "OrderDeTailsPage",
  components: {
    OrderDetails,
    Breadcum,
  },
  computed: {
    orderCode() {
      return this.$route.params.orderCode;
    },
  },
};
</script>
