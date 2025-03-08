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
import Wishlist from '../components/user/Wishlist.vue';
import ProductPage from '../views/user/ProductPage.vue';
import ProductDetailPage from '../views/user/ProductDetailPage.vue';
import ProductSearchPage from '../views/user/ProductSearchPage.vue';
import CartPage from '../views/user/CartPage.vue';
import { useAuthStore } from '../store/AuthStore';
import OrderInfo from '../components/user/OrderInfo.vue';
import OrderDetailsPage from '../views/user/OrderDetailsPage.vue';
import SignupAdminPage from '../views/admin/SignupAdminPage.vue';
import OrderManager from '../components/admin/OrderManager.vue';

// Các route
const routes = [
  { path: '/', name: 'Home', component: Home },
  {
    path: '/category/:slug',
    name: 'CategoryPage',
    component: ProductPage,
    props: true,
  },
  {
    path: '/search/:keyword',
    name: 'ProductSearchPage',
    component: ProductSearchPage,
    props: true,
  },
  {
    path: "/product/:slug",
    name: "ProductDetailPage",
    component: ProductDetailPage,
    props: true,
  },
  {
    path: '/cart',
    name: 'CartPage',
    component: CartPage,
     meta: { requiresAuth: true }, // Thêm meta yêu cầu đăng nhập
  },
  {
  path: "/order-details/:orderCode",
  name: "OrderDetails",
  component: OrderDetailsPage,
  meta: { requiresAuth: true },
  props: true
},
  { path: '/login', name: 'LoginPage', component: LoginPage },
  { path: '/signup', name: 'SignupPage', component: SignupPage },
   { path: '/signup-admin', name: 'SignupAdminPage', component: SignupAdminPage },
  {
    path: "/profile",
    component: ProfilePage,
    meta: { requiresAuth: true }, // Thêm meta yêu cầu đăng nhập
    children: [
      { path: "", component: ProfileInfo },
      { path: "address", name: "Address", component: AddressForm },
      { path: "orders", name: "Orders", component: OrderInfo },
       { path: "wishlist", name: "Wishlist", component: Wishlist }, // Trang Wishlist
    ],
  },
  {
    path: '/admin',
    name: 'AdminPage',
    component: AdminPage,
    meta: { requiresAuth: true,requiresAdmin: true, hideHeaderFooter: true }, // Admin cũng yêu cầu đăng nhập
    
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'brands', name: 'BrandManagement', component: BrandManagement },
      { path: 'categories', name: 'CategoryManagement', component: CategoryManagement },
      { path: "products/add", name: "AddProductForm", component: AddProductForm },
      { path: "products/list", name: "ProductManager", component: ProductManager },
      { path: 'user/information', name: 'UserManagement', component: UserManager },
       { path: 'orders/list', name: 'OrderManager', component: OrderManager },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

// Tạo router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('token');
  const authStore = useAuthStore();  // Sử dụng store để lấy thông tin role

  // Kiểm tra nếu route yêu cầu đăng nhập và người dùng chưa đăng nhập
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'LoginPage', query: { redirect: to.fullPath } });
  } else if (to.meta.requiresAdmin && authStore.role !== 'admin') {
    // Nếu route yêu cầu admin và người dùng không phải admin
    next({ name: 'Home' });  // Hoặc bạn có thể chuyển hướng đến một trang khác như trang lỗi
  } else if ((to.name === 'LoginPage' || to.name === 'SignupPage') && isLoggedIn) {
    next({ name: 'Home' });
  } else {
    next();
  }
});



export default router;
