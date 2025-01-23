import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

// Import Bootstrap CSS và JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// Import Font Awesome
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';

// Import router
import router from './router'; // Đường dẫn tệp router của bạn

// Khởi tạo ứng dụng
createApp(App).use(router).mount('#app');
