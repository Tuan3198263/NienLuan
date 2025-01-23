<template>
  <div class="brand-management">
    <h2>Quản lý Thương hiệu</h2>
    <!-- Tìm kiếm thương hiệu -->
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        @input="filterBrands"
        placeholder="Tìm kiếm thương hiệu..."
      />
    </div>

    <!-- Nút thêm thương hiệu mới -->
    <div class="add-brand">
      <button @click="addBrand">Thêm thương hiệu mới</button>
    </div>

    <!-- Bảng danh sách thương hiệu -->
    <table class="brand-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên Thương Hiệu</th>
          <th>Mô Tả</th>
          <th>Ngày Tạo</th>
          <th>Trạng Thái</th>
          <th>Hành Động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="brand in filteredBrands" :key="brand.id">
          <td>{{ brand.id }}</td>
          <td>{{ brand.name }}</td>
          <td>{{ brand.description }}</td>
          <td>{{ brand.createdAt }}</td>
          <td>{{ brand.status }}</td>
          <td>
            <button @click="viewBrand(brand)">
              <i class="fas fa-eye"></i>
              <!-- Biểu tượng xem -->
            </button>
            <button @click="editBrand(brand)">
              <i class="fas fa-edit"></i>
              <!-- Biểu tượng chỉnh sửa -->
            </button>
            <button @click="deleteBrand(brand.id)">
              <i class="fas fa-trash-alt"></i>
              <!-- Biểu tượng xóa -->
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // Dữ liệu ảo cho các thương hiệu (thêm các trường mô tả, ngày tạo, trạng thái)
      brands: [
        {
          id: 1,
          name: "Nike",
          description: "Giày thể thao cao cấp",
          createdAt: "2023-01-01",
          status: "Hoạt động",
        },
        {
          id: 2,
          name: "Adidas",
          description: "Giày thể thao chuyên dụng",
          createdAt: "2022-06-15",
          status: "Ngừng hoạt động",
        },
        {
          id: 3,
          name: "Puma",
          description: "Trang phục thể thao",
          createdAt: "2021-08-10",
          status: "Hoạt động",
        },
        {
          id: 4,
          name: "Reebok",
          description: "Giày thể thao năng động",
          createdAt: "2022-03-21",
          status: "Hoạt động",
        },
        {
          id: 5,
          name: "Under Armour",
          description: "Thể thao và áo khoác",
          createdAt: "2020-11-30",
          status: "Ngừng hoạt động",
        },
      ],
      searchQuery: "",
      filteredBrands: [],
    };
  },
  methods: {
    // Lọc danh sách thương hiệu theo tìm kiếm
    filterBrands() {
      this.filteredBrands = this.brands.filter((brand) =>
        brand.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },

    // Thêm thương hiệu mới (mở form hoặc xử lý thêm vào cơ sở dữ liệu)
    addBrand() {
      alert("Thêm thương hiệu mới!");
      // Mở modal hoặc chuyển trang tới form thêm thương hiệu
    },

    // Xem chi tiết thương hiệu
    viewBrand(brand) {
      alert(`Xem chi tiết thương hiệu: ${brand.name}`);
      // Chuyển hướng tới trang xem chi tiết thương hiệu hoặc mở modal
    },

    // Chỉnh sửa thông tin thương hiệu
    editBrand(brand) {
      alert(`Chỉnh sửa thương hiệu: ${brand.name}`);
      // Mở form chỉnh sửa hoặc chuyển hướng tới trang chỉnh sửa
    },

    // Xóa thương hiệu
    deleteBrand(brandId) {
      const confirmDelete = confirm(
        "Bạn có chắc chắn muốn xóa thương hiệu này?"
      );
      if (confirmDelete) {
        this.brands = this.brands.filter((brand) => brand.id !== brandId);
        this.filterBrands();
        alert("Thương hiệu đã được xóa!");
      }
    },
  },
  mounted() {
    // Lọc danh sách khi trang được tải
    this.filteredBrands = this.brands;
  },
};
</script>

<style scoped>
.brand-management {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  padding: 8px;
  width: 300px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.add-brand button {
  padding: 10px 15px;
  margin-bottom: 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-brand button:hover {
  background-color: #218838;
}

.brand-table {
  width: 100%;
  border-collapse: collapse;
}

.brand-table th,
.brand-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.brand-table th {
  background-color: #f8f9fa;
}

.brand-table td button {
  padding: 5px 10px;
  margin-right: 10px;
  cursor: pointer;
}

.brand-table td button:hover {
  background-color: #f1f1f1;
}

.brand-table td i {
  font-size: 18px;
}
</style>
