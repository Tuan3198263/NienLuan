// ẩn tắt cả cánh báo
process.removeAllListeners('warning');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectToDatabase = require("./db"); // Import file kết nối MongoDB

dotenv.config(); // Load biến môi trường từ file .env

const app = express();

const authRoutes = require('./api/authRoutes'); // Import routes
const categoryRoutes = require("./api/categoryRoutes");
const productRoutes = require("./api/productRoutes");
const brandRoutes = require("./api/brandRoutes")
const shippingAddressRoutes = require("./api/shippingAddressRoutes")
const favoriteRoutes = require('./api/favoriteRoutes'); // Import route yêu thích
const cartRoutes = require('./api/cartRoutes')
const orderRoutes = require('./api/orderRoutes')
const reviewRoutes = require('./api/reviewRoutes');
const emailRoutes = require('./api/emailRoutes')

// Kết nối tới MongoDB
connectToDatabase();
// Middlewar
app.use(express.json());  // Thay vì bodyParser.json()

app.use(cors()); // Cho phép cross-origin requests



// Định nghĩa route cho danh mục
app.use("/api/categories", categoryRoutes);
//route sản phẩm
app.use("/api/products", productRoutes);
//route thương hiệu
app.use("/api/brands", brandRoutes);

app.use('/api/auth', authRoutes); // Sử dụng API cho authentication

// Sử dụng các routes
app.use('/api/shipping-address', shippingAddressRoutes); // Định nghĩa route cho địa chỉ nhận hàng

// Sử dụng route yêu thích
app.use('/api/favorites', favoriteRoutes); // Đăng ký route cho favorite, 

//sử dụng các routes cart
app.use('/api/cart', cartRoutes)


//routes order
app.use('/api/order', orderRoutes)

// đánh giá
app.use('/api/reviews', reviewRoutes);

//mail
app.use('/api/email', emailRoutes);



(async () => {
    const { default: SmeeClient } = await import('smee-client');

    const smee = new SmeeClient({
        source: 'https://smee.io/DC5tmeYA0vSSFNIV', // URL Webhook Proxy từ Smee.io
        target: 'http://localhost:3000/api/order/webhook', // Webhook được chuyển đến API của bạn
        logger: console
    });

    smee.start(); // Bắt đầu lắng nghe Webhook từ Smee.io
})();





// Định nghĩa route mặc định
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// Định nghĩa cổng
const PORT = process.env.PORT || 3000;

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
