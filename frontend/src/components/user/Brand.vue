<template>
  <div class="container brand-directory mt-2">
    <Breadcrumb />
    <h1 class="title text-center">Thương Hiệu</h1>

    <!-- Điều hướng theo bảng chữ cái -->
    <div class="alphabet-nav d-flex justify-content-center flex-wrap mb-3">
      <a
        v-for="letter in availableLetters"
        :key="letter"
        :href="`#${letter}`"
        :class="['letter', 'mx-2', { active: activeLetter === letter }]"
        @click.prevent="scrollToLetter(letter)"
      >
        {{ letter }}
      </a>
    </div>

    <div class="divider"></div>

    <!-- Hiển thị vòng quay tải dữ liệu -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <!-- Danh sách thương hiệu theo chữ cái -->
    <div v-else class="brand-sections" ref="brandSections">
      <div
        v-for="letter in availableLetters"
        :key="letter"
        :id="letter"
        class="brand-section mt-3"
      >
        <div class="letter-heading">{{ letter }}</div>
        <div class="brands-list">
          <div
            v-for="brand in getBrandsByLetter(letter)"
            :key="brand._id"
            class="brand-item"
          >
            <!-- Thêm router-link để điều hướng tới trang chi tiết của thương hiệu -->
            <router-link
              :to="`/brands/${brand._id}`"
              class="text-decoration-none text-secondary"
            >
              <span>{{ brand.name }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Breadcrumb from "./Breadcrumb.vue";
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const brands = ref([]); // Danh sách thương hiệu
const loading = ref(true); // Trạng thái tải dữ liệu
const activeLetter = ref(""); // Chữ cái đang được chọn

// Lấy danh sách thương hiệu từ API
const fetchBrands = async () => {
  try {
    loading.value = true;
    const response = await axios.get("http://localhost:3000/api/brands/");

    // Xử lý dữ liệu để thêm thuộc tính chữ cái đầu tiên
    brands.value = response.data.map((brand) => ({
      ...brand,
      letter: brand.name.charAt(0).toUpperCase(),
    }));

    loading.value = false;
  } catch (error) {
    console.error("Lỗi khi tải danh sách thương hiệu:", error);
    loading.value = false;
  }
};

// Lấy danh sách các chữ cái có thương hiệu
const availableLetters = computed(() => {
  const letters = [...new Set(brands.value.map((brand) => brand.letter))];
  return letters.sort();
});

// Lấy danh sách thương hiệu theo chữ cái
const getBrandsByLetter = (letter) => {
  return brands.value
    .filter((brand) => brand.letter === letter)
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Cuộn trang đến danh mục theo chữ cái
const scrollToLetter = (letter) => {
  activeLetter.value = letter;
  const element = document.getElementById(letter);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

// Tải dữ liệu khi component được mount
onMounted(async () => {
  await fetchBrands();
  if (availableLetters.value.length > 0) {
    activeLetter.value = availableLetters.value[0];
  }
});
</script>
<style scoped>
.brand-directory {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.title {
  font-size: 28px;
  margin-bottom: 30px;
  color: #000;
}

.alphabet-nav {
  gap: 20px;
}

.letter {
  color: #000;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
}

.letter.active {
  font-weight: bold;
  color: #000;
}

/* Thanh chữ cái */
.alphabet-nav {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

/* Chữ cái lớn (A, B, C, ...) */
.letter-heading {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  padding: 10px 0;
  color: #000;
}

/* Đường kẻ ngang phân cách */
.letter-heading::before {
  content: "";
  display: block;
  width: 100%;
  height: 1px;
  background-color: #000;
  margin-bottom: 10px;
}

/* Danh sách thương hiệu */
.brands-list {
  padding-left: 20px;
}

/* Tên thương hiệu */
.brand-item {
  font-size: 20px;
  font-weight: 400;
  color: #444;
  margin-bottom: 5px;
  cursor: pointer;
  margin-left: 20px;
}

@media (max-width: 768px) {
  .letter-heading {
    font-size: 20px;
  }

  .brand-item {
    font-size: 14px;
  }
}
</style>
