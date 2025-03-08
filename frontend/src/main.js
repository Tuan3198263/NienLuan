import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia'; // Import Pinia

// Nếu dùng Bootstrap 5 (cần cả phần CSS và JS)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import Font Awesome
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';

import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

// Import router
import router from './router'; // Đường dẫn tệp router của bạn

// Khởi tạo ứng dụng Vue
const app = createApp(App);



// Cấu hình Toastification
app.use(Toast, {
  position: POSITION.TOP_RIGHT, // Vẫn giữ vị trí TOP_RIGHT
  timeout: 2000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 1,
  transition: "Vue-Toastification__fade", // Chuyển sang hiệu ứng fade in/out
});


// Đăng ký vue-select
app.component('v-select', vSelect); // Đăng ký component toàn cục

// Sử dụng router
app.use(router);

// Sử dụng Pinia
app.use(createPinia()); // Đảm bảo gọi app.use(pinia) sau khi khởi tạo pinia

// Mount ứng dụng Vue
app.mount('#app');
