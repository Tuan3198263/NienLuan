<template>
  <div class="container py-4">
    <!-- Tabs -->
    <div class="d-flex mb-3 border-bottom pb-2">
      <button
        class="btn btn-link fw-bold px-3 py-2 text-decoration-none"
        :class="{
          'text-pink-500': activeTab === 'description',
          'text-secondary': activeTab !== 'description',
        }"
        @click="setActiveTab('description')"
      >
        Mô tả
      </button>
      <button
        class="btn btn-link fw-bold px-3 py-2 text-decoration-none"
        :class="{
          'text-pink-500': activeTab === 'ingredients',
          'text-secondary': activeTab !== 'ingredients',
        }"
        @click="setActiveTab('ingredients')"
      >
        Thành phần
      </button>
      <button
        class="btn btn-link fw-bold px-3 py-2 text-decoration-none"
        :class="{
          'text-pink-500': activeTab === 'usage',
          'text-secondary': activeTab !== 'usage',
        }"
        @click="setActiveTab('usage')"
      >
        Cách sử dụng
      </button>
    </div>

    <!-- Content -->
    <div class="mt-4">
      <!-- Mô tả -->
      <div v-if="activeTab === 'description'" class="mb-4">
        <div
          class="content-box border rounded p-3"
          v-html="
            showMore.description
              ? product.description
              : truncatedContent(product.description, 'description')
          "
        ></div>
        <button
          v-if="needToggle.description"
          class="btn btn-link text-decoration-none mt-2 px-0 fw-bold"
          @click="toggleShowMore('description')"
        >
          {{ showMore.description ? "Thu gọn" : "Xem thêm" }}
        </button>
      </div>

      <!-- Thành phần -->
      <div v-if="activeTab === 'ingredients'" class="mb-4">
        <div
          class="content-box border rounded p-3"
          v-html="
            showMore.ingredients
              ? product.ingredients
              : truncatedContent(product.ingredients, 'ingredients')
          "
        ></div>
        <button
          v-if="needToggle.ingredients"
          class="btn btn-link text-decoration-none mt-2 px-0 fw-bold"
          @click="toggleShowMore('ingredients')"
        >
          {{ showMore.ingredients ? "Thu gọn" : "Xem thêm" }}
        </button>
      </div>

      <!-- Cách sử dụng -->
      <div v-if="activeTab === 'usage'" class="mb-4">
        <div
          class="content-box border rounded p-3"
          v-html="
            showMore.usage
              ? product.usage
              : truncatedContent(product.usage, 'usage')
          "
        ></div>
        <button
          v-if="needToggle.usage"
          class="btn btn-link text-decoration-none mt-2 px-0 fw-bold"
          @click="toggleShowMore('usage')"
        >
          {{ showMore.usage ? "Thu gọn" : "Xem thêm" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import truncate from "truncate-html"; // Cần cài đặt: npm install html-truncate

export default {
  name: "ProductInfoTabs",
  props: {
    productInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const activeTab = ref("description");

    // Trạng thái "Xem thêm" và "needToggle" cho từng phần
    const showMore = ref({
      description: false,
      ingredients: false,
      usage: false,
    });

    const needToggle = ref({
      description: false,
      ingredients: false,
      usage: false,
    });

    // Hàm chuyển tab
    const setActiveTab = (tab) => {
      activeTab.value = tab;
    };

    // Hàm cắt ngắn nội dung HTML mà vẫn giữ định dạng
    const truncatedContent = (content, key) => {
      if (!content) return "";

      // Tính toán plain text để quyết định hiển thị nút "Xem thêm"
      const plainText = content.replace(/<[^>]*>?/gm, "");
      needToggle.value[key] = plainText.length > 150;

      // Nếu nội dung dài hơn 150 ký tự, dùng html-truncate để cắt ngắn mà vẫn giữ lại định dạng HTML
      return plainText.length > 150
        ? truncate(content, 150, { ellipsis: "..." })
        : content;
    };

    // Hàm toggle trạng thái "Xem thêm"
    const toggleShowMore = (key) => {
      showMore.value[key] = !showMore.value[key];
    };

    return {
      activeTab,
      setActiveTab,
      truncatedContent,
      toggleShowMore,
      showMore,
      needToggle,
      product: props.productInfo, // Dữ liệu sản phẩm truyền vào từ props
    };
  },
};
</script>
