<template>
  <div class="container mx-auto p-4">
    <Product :slug="slug" />
  </div>
</template>

<script setup>
import Product from "../../components/user/Product.vue";
const props = defineProps({
  slug: String,
});
</script>

<style scoped></style>
