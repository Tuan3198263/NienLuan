//middleware/authMiddleware
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Lấy token từ header Authorization
    
    if (!token) {
        return res.status(403).json({ message: 'Không có token, truy cập bị từ chối.' });
    }

    try {
        // Verify token
        const user = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = user; // Lưu thông tin người dùng vào request
        next(); // Tiến hành tiếp tục đến route handler
    } catch (err) {
        console.log("Token verification error:", err.message); // Log lỗi token không hợp lệ
        return res.status(403).json({ message: 'Token không hợp lệ.' });
    }
};

module.exports = authMiddleware;

