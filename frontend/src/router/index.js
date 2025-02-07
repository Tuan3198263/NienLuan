import { createRouter, createWebHistory } from 'vue-router';

// Import các component dùng làm route

import AdminPage from '../views/admin/AdminPage.vue';
import Dashboard from '../components/admin/Dashboard.vue';
import BrandManagement from '../components/admin/BrandManagement.vue';
import CategoryManagement from '../components/admin/CategoryManagement.vue';
import AddProductForm from '../components/admin/AddProductForm.vue';
import ProductManager from '../components/admin/ProductManager.vue';
import UserManager from '../components/admin/UserManager.vue';
import Home from '../views/user/Home.vue';
import NotFound from '../views/user/NotFound.vue';
import LoginPage from '../views/user/LoginPage.vue';
import SignupPage from '../views/user/SignupPage.vue';
import ProfilePage from '../views/user/ProfilePage.vue';
import ProfileInfo from '../components/user/ProfileInfo.vue';
import AddressForm from '../components/user/AddressForm.vue';

const routes = [
  { path: '/', 
    name: 'Home',
     component: Home },

  {path: '/login',
    name:'LoginPage',
    component: LoginPage,
  },
  {path: '/signup',
    name:'SinupPage',
    component: SignupPage,
  },
   {
  path: "/profile",
  component: ProfilePage,
  children: [
    { path: "", component: ProfileInfo }, // Mặc định vào "Thông tin cá nhân"
    {
      path: "address", // Không cần "/profile/address", chỉ cần "address"
      name: "Address",
      component: AddressForm,
    },
      //{ path: "orders", component: OrdersPage }, // Đơn hàng
      //{ path: "favorites", component: FavoritesPage }, // Yêu thích
      //{ path: "cart", component: CartPage }, // Giỏ hàng
  ],
},
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
        path: 'brands', // Đường dẫn cho trang quản lý thương hiệu
        name: 'BrandManagement',
        component: BrandManagement, // Sử dụng component BrandManagement
      },
      {
        path: 'categories', // Đường dẫn cho trang quản lý danh mục
        name: 'CategoryManagement',
        component: CategoryManagement, // Sử dụng component 
      },
    
      {
        path: "products/add", // Đường dẫn thêm sản phẩm
        name: "AddProductForm",
        component: AddProductForm,
      },
      {
        path: "products/list", // Đường dẫn thêm sản phẩm
        name: "ProductManager",
        component: ProductManager,
      },

        // Thêm route cho trang quản lý người dùng
    {
      path: 'user/information', // Đường dẫn cho trang quản lý người dùng
      name: 'UserManagement',
      component: UserManager, // Sử dụng component UserManagement
    },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
