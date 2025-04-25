// ẩn tắt cả cánh báo
process.removeAllListeners('warning');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectToDatabase = require("./db"); // Import file kết nối MongoDB
const { initSocketIO } = require('./utils/socketManager'); // Import socket m

dotenv.config(); // Load biến môi trường từ file .env

const app = express();

// Kết nối tới MongoDB
connectToDatabase();

// Middlewares - đặt trước tất cả các routes
app.use(express.json());  // Thay vì bodyParser.json()
app.use(cors()); // Cho phép cross-origin requests

// Import routes
const authRoutes = require('./api/authRoutes');
const categoryRoutes = require("./api/categoryRoutes");
const productRoutes = require("./api/productRoutes");
const brandRoutes = require("./api/brandRoutes");
const shippingAddressRoutes = require("./api/shippingAddressRoutes");
const favoriteRoutes = require('./api/favoriteRoutes');
const cartRoutes = require('./api/cartRoutes');
const orderRoutes = require('./api/orderRoutes');
const reviewRoutes = require('./api/reviewRoutes');
const emailRoutes = require('./api/emailRoutes');
const notificationRoutes = require('./api/notificationRoutes');
const dashboardRoutes = require('./api/dashboardRoutes');
const chatbotRoutes = require('./api/chatbotRoutes'); // Thêm import route chatbot

// Định nghĩa route mặc định
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// Đăng ký tất cả các routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/shipping-address', shippingAddressRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes); // Thêm route chatbot

// Định nghĩa cổng
const PORT = process.env.PORT || 3000;

// Khởi động server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// Khởi tạo Socket.IO
const io = initSocketIO(server);

// Chạy listener để lắng nghe sự kiện
require("./events/notificationListener.js"); 


// Initialize Smee client AFTER server is running
(async () => {
    try {
        const { default: SmeeClient } = await import('smee-client');
        
        const smee = new SmeeClient({
            source: 'https://smee.io/DC5tmeYA0vSSFNIV',
            target: `http://localhost:${PORT}/api/order/webhook`,
            logger: console
        });
        
        smee.start();
        console.log('Smee client started successfully');
    } catch (error) {
        console.error('Failed to initialize Smee client:', error);
    }
})();

