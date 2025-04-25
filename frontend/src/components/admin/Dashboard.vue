<template>
  <div class="dashboard-container">
    <h1 class="dashboard-title">Tổng Quan</h1>

    <!-- KPI Cards -->
    <div class="kpi-cards">
      <div class="kpi-card">
        <div class="kpi-icon revenue-icon">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="kpi-content">
          <h3>Tổng Doanh Thu</h3>
          <p class="kpi-value">
            {{ formatCurrency(dashboardData.totalRevenue) }}
          </p>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon orders-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="kpi-content">
          <h3>Tổng Đơn Hàng</h3>
          <p class="kpi-value">{{ dashboardData.totalOrders }}</p>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon products-icon">
          <i class="fas fa-box"></i>
        </div>
        <div class="kpi-content">
          <h3>Tổng Sản Phẩm</h3>
          <p class="kpi-value">{{ dashboardData.totalProducts }}</p>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon users-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="kpi-content">
          <h3>Tổng Người Dùng</h3>
          <p class="kpi-value">{{ dashboardData.totalUsers }}</p>
        </div>
      </div>
    </div>

    <!-- Additional KPI Cards -->
    <div class="kpi-cards">
      <div class="kpi-card">
        <div class="kpi-icon avg-order-icon">
          <i class="fas fa-receipt"></i>
        </div>
        <div class="kpi-content">
          <h3>Giá Trị Đơn Hàng Trung Bình</h3>
          <p class="kpi-value">
            {{ formatCurrency(dashboardData.avgOrderValue) }}
          </p>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon cancel-rate-icon">
          <i class="fas fa-ban"></i>
        </div>
        <div class="kpi-content">
          <h3>Tỷ Lệ Hủy Đơn</h3>
          <p class="kpi-value">{{ dashboardData.cancelRate.toFixed(1) }}%</p>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon stock-icon">
          <i class="fas fa-cubes"></i>
        </div>
        <div class="kpi-content">
          <h3>Tổng Hàng Tồn Kho</h3>
          <p class="kpi-value">{{ dashboardData.totalStock }}</p>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon low-stock-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="kpi-content">
          <h3>Sản Phẩm Sắp Hết</h3>
          <p class="kpi-value">{{ dashboardData.lowStockProducts }}</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-container">
      <div class="chart-card">
        <h3>Doanh Thu Theo Tháng</h3>
        <canvas ref="monthlyRevenueChart"></canvas>
      </div>

      <div class="chart-card">
        <h3>Đơn Hàng Theo Ngày</h3>
        <canvas ref="ordersByDayChart"></canvas>
      </div>
    </div>

    <!-- Top Products Section -->
    <div class="top-products-container">
      <div class="chart-card">
        <h3>Sản Phẩm Bán Chạy Nhất</h3>
        <div class="top-products-list">
          <div
            v-for="(product, index) in dashboardData.topSellingProducts"
            :key="index"
            class="top-product-item"
          >
            <div class="product-rank">{{ index + 1 }}</div>
            <div class="product-image">
              <img :src="product.image" alt="Product image" />
            </div>
            <div class="product-details">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-sold">
                Đã bán: <span>{{ product.totalSold }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Customers Section -->
    <div class="top-customers-container">
      <div class="chart-card">
        <h3>Khách Hàng Tiềm Năng</h3>
        <div class="top-customers-list">
          <div
            v-for="(customer, index) in dashboardData.topCustomers"
            :key="index"
            class="top-customer-item"
          >
            <div class="customer-rank">{{ index + 1 }}</div>
            <div class="customer-icon">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="customer-details">
              <div class="customer-email">{{ customer.email }}</div>
              <div class="customer-spent">
                Tổng chi tiêu:
                <span>{{ formatCurrency(customer.totalSpent) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Stats -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>Đơn Hàng Đang Xử Lý</h3>
          <p class="stat-value">{{ dashboardData.pendingOrders }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-content">
          <h3>Đơn Hàng Bị Hủy</h3>
          <p class="stat-value">{{ dashboardData.canceledOrders }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-user-plus"></i>
        </div>
        <div class="stat-content">
          <h3>Người Dùng Mới Tháng Này</h3>
          <p class="stat-value">{{ dashboardData.newUsersThisMonth }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-tag"></i>
        </div>
        <div class="stat-content">
          <h3>Tổng Danh Mục</h3>
          <p class="stat-value">{{ dashboardData.totalCategories }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-copyright"></i>
        </div>
        <div class="stat-content">
          <h3>Tổng Thương Hiệu</h3>
          <p class="stat-value">{{ dashboardData.totalBrands }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon unsold-icon">
          <i class="fas fa-archive"></i>
        </div>
        <div class="stat-content">
          <h3>Sản Phẩm Chưa Bán Được</h3>
          <p class="stat-value">{{ dashboardData.unsoldProducts }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import Chart from "chart.js/auto";

// References for chart elements
const monthlyRevenueChart = ref(null);
const ordersByDayChart = ref(null);

// Chart instances
const charts = ref({
  monthlyRevenue: null,
  ordersByDay: null,
});

// Dashboard data
const dashboardData = ref({
  totalProducts: 0,
  totalCategories: 0,
  totalBrands: 0,
  totalOrders: 0,
  totalRevenue: 0,
  avgOrderValue: 0,
  cancelRate: 0,
  ordersByMonth: [],
  ordersByDay: [],
  totalUsers: 0,
  pendingOrders: 0,
  canceledOrders: 0,
  newUsersThisMonth: 0,
  topSellingProducts: [],
  lowStockProducts: 0,
  totalStock: 0,
  topCustomers: [],
  unsoldProducts: 0,
});

// Format currency helper
const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/dashboard/");
    dashboardData.value = response.data;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu bảng điều khiển:", error);
  }
};

// Initialize charts
const initCharts = () => {
  renderMonthlyRevenueChart();
  renderOrdersByDayChart();
};

// Render monthly revenue chart
const renderMonthlyRevenueChart = () => {
  const ctx = monthlyRevenueChart.value.getContext("2d");

  // Process data for chart
  const monthlyData = dashboardData.value.ordersByMonth;
  const labels = monthlyData.map((item) => {
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];
    return `${monthNames[item._id.month - 1]} ${item._id.year}`;
  });

  const revenueData = monthlyData.map((item) => item.revenue / 1000000); // Convert to millions
  const ordersData = monthlyData.map((item) => item.count);

  charts.value.monthlyRevenue = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Doanh Thu (Triệu VNĐ)",
          data: revenueData,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          yAxisID: "y",
        },
        {
          label: "Đơn Hàng",
          data: ordersData,
          type: "line",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          position: "left",
          title: {
            display: true,
            text: "Doanh Thu (Triệu VNĐ)",
          },
        },
        y1: {
          beginAtZero: true,
          position: "right",
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: "Đơn Hàng",
          },
        },
      },
    },
  });
};

// Render orders by day chart
const renderOrdersByDayChart = () => {
  const ctx = ordersByDayChart.value.getContext("2d");

  // Process data for chart
  const dailyData = [...dashboardData.value.ordersByDay];
  // Sort by day
  dailyData.sort((a, b) => a._id.day - b._id.day);

  const labels = dailyData.map((item) => `Ngày ${item._id.day}`);
  const data = dailyData.map((item) => item.count);

  charts.value.ordersByDay = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Số Đơn Hàng",
          data: data,
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          stepSize: 1,
        },
      },
    },
  });
};

// Lifecycle hooks
onMounted(async () => {
  await fetchDashboardData();
  initCharts();
});

onBeforeUnmount(() => {
  // Destroy chart instances to prevent memory leaks
  Object.values(charts.value).forEach((chart) => {
    if (chart) {
      chart.destroy();
    }
  });
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fb;
}

.dashboard-title {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.kpi-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.kpi-card {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.kpi-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.revenue-icon {
  background-color: #4caf50;
}

.orders-icon {
  background-color: #2196f3;
}

.products-icon {
  background-color: #ff9800;
}

.users-icon {
  background-color: #9c27b0;
}

.avg-order-icon {
  background-color: #009688;
}

.cancel-rate-icon {
  background-color: #f44336;
}

.stock-icon {
  background-color: #795548;
}

.low-stock-icon {
  background-color: #ff5722;
}

.unsold-icon {
  background-color: #607d8b;
}

.kpi-content h3 {
  font-size: 14px;
  color: #666;
  margin: 0 0 5px 0;
}

.kpi-value {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.top-products-container,
.top-customers-container {
  margin-bottom: 25px;
}

.chart-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.chart-card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.wide-card {
  min-height: 350px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
  color: white;
  background-color: #607d8b;
}

.stat-content h3 {
  font-size: 12px;
  color: #666;
  margin: 0 0 5px 0;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* Top Products List */
.top-products-list,
.top-customers-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.top-product-item,
.top-customer-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: transform 0.2s;
}

.top-product-item:hover,
.top-customer-item:hover {
  transform: translateX(5px);
  background-color: #f0f0f0;
}

.product-rank,
.customer-rank {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-right: 15px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #e3f2fd;
  color: #2196f3;
}

.product-image {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  border-radius: 6px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.customer-icon {
  font-size: 28px;
  color: #607d8b;
  margin-right: 15px;
}

.product-details,
.customer-details {
  flex: 1;
}

.product-name,
.customer-email {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.product-sold,
.customer-spent {
  font-size: 14px;
  color: #666;
}

.product-sold span,
.customer-spent span {
  font-weight: 600;
  color: #4caf50;
}

@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }

  .kpi-cards {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

canvas {
  width: 100% !important;
  height: 300px !important;
}
</style>
