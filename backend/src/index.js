const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectToDatabase = require("./db"); // Import file kết nối MongoDB

dotenv.config(); // Load biến môi trường từ file .env

const app = express();


const categoryRoutes = require("./api/categoryRoutes");
const productRoutes = require("./api/productRoutes")

// Kết nối tới MongoDB
connectToDatabase();
// Middleware
app.use(bodyParser.json()); // Xử lý JSON từ body request
app.use(cors()); // Cho phép cross-origin requests

// Định nghĩa route cho danh mục
app.use("/api/categories", categoryRoutes);
//route sản phẩm
app.use("/api/products", productRoutes);



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
