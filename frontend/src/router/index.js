import { createRouter, createWebHistory } from 'vue-router';

// Import các component dùng làm route

import AdminPage from '../views/admin/AdminPage.vue';
import Dashboard from '../components/admin/Dashboard.vue';
import BrandManagement from '../components/admin/BrandManagement.vue';

const routes = [
  { path: '/' },
  {
    path: '/admin',
    name: 'AdminPage',
    component: AdminPage,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
      },
       // Thêm route cho trang quản lý thương hiệu
      {
        path: 'products/brands', // Đường dẫn cho trang quản lý thương hiệu
        name: 'BrandManagement',
        component: BrandManagement, // Sử dụng component BrandManagement
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
