<template>
  <div class="container mx-auto p-4">
    <ProductSearch :keyword="keyword" />
  </div>
</template>

<script setup>
import ProductSearch from "../../components/user/ProductSearch.vue";
const props = defineProps({
  keyword: String,
});
</script>

<style scoped></style>
