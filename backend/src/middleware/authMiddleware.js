const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Lấy token từ header
    
    console.log("Token received:", token); // Log token để kiểm tra

    if (!token) {
        return res.status(403).json({ message: 'Không có token, truy cập bị từ chối.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("Token verification error:", err.message); // Log lỗi token không hợp lệ
            return res.status(403).json({ message: 'Token không hợp lệ.' });
        }

        console.log("User from token:", user); // Log user từ token
        req.user = user; // Lưu thông tin người dùng vào request
        next();
    });
};

module.exports = authMiddleware;
