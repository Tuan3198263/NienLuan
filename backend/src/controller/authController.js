const jwt = require('jsonwebtoken');
const User = require('../models/user');
const cloudinary = require('cloudinary').v2;
const eventEmitter = require("../events/event.js"); // Import EventEmitter
const ShippingAddress = require('../models/shippingAddress');
const Order = require('../models/order');
const Review = require('../models/review');


// API lấy tất cả người dùng
exports.getAllUsers = async (req, res) => {
    try {
        // Lấy tất cả người dùng từ cơ sở dữ liệu
        const users = await User.find();
        
        // Mảng kết quả với thông tin mở rộng
        const usersWithDetails = [];
        
        // Xử lý từng người dùng để lấy thông tin bổ sung
        for (const user of users) {
            // Lấy địa chỉ nhận hàng của người dùng
            const shippingAddresses = await ShippingAddress.find({ userId: user._id });
            
            // Lấy tất cả đơn hàng của người dùng
            const orders = await Order.find({ userId: user._id });
            
            // Lấy tất cả đánh giá của người dùng
            const reviews = await Review.find({ userId: user._id }).populate('productId', 'name');
            
            // Tính toán các thống kê đơn hàng
            const orderStats = {
                totalOrders: orders.length,
                pendingOrders: orders.filter(order => order.status === 'pending').length,
                processedOrders: orders.filter(order => order.status === 'processed').length,
                shippedOrders: orders.filter(order => order.status === 'shipped').length,
                deliveredOrders: orders.filter(order => order.status === 'delivered').length,
                canceledOrders: orders.filter(order => order.status === 'canceled').length,
                returnedOrders: orders.filter(order => order.status === 'returned').length,
                totalSpent: orders
                    .filter(order => order.status === 'delivered')
                    .reduce((sum, order) => sum + order.totalPrice, 0)
            };
            
            // Thống kê về sản phẩm đã đánh giá
            const reviewStats = {
                totalReviews: reviews.length,
                averageRating: reviews.length > 0 
                    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) 
                    : 0,
                reviewedProducts: reviews.map(review => ({
                    productId: review.productId._id,
                    productName: review.productId ? review.productId.name : 'Sản phẩm không tồn tại',
                    rating: review.rating,
                    comment: review.comment,
                    createdAt: review.createdAt
                }))
            };
            
            // Tạo đối tượng người dùng mở rộng
            const userWithDetails = {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                password: user.password,
                role: user.role,
                ban: user.ban,
                avatar: user.avatar,
                createdAt: user.createdAt,
                shippingAddresses,
                orderStats,
                reviewStats
            };
            
            usersWithDetails.push(userWithDetails);
        }
        
        res.json({ 
            message: 'Lấy tất cả người dùng thành công!', 
            users: usersWithDetails 
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};

// 📌 Đăng ký người dùng
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng.' });
        }

        const newUser = new User({ fullName, email, password, phone });
        await newUser.save();

        // 🔥 Phát sự kiện "newUserRegistered"
        eventEmitter.emit("newUserRegistered", newUser);

        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};

// 📌 Đăng ký Admin với mã xác thực
exports.registerAdmin = async (req, res) => {
    try {
        const { fullName, email, password, phone, verificationCode } = req.body;

        const validVerificationCode = process.env.ADMIN_VERIFICATION_CODE;
        if (verificationCode !== validVerificationCode) {
            return res.status(400).json({ message: 'Mã xác thực không hợp lệ.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng.' });
        }

        const newAdmin = new User({ 
            fullName, 
            email, 
            password, 
            phone,
            role: 'admin'
        });

        await newAdmin.save();

        // 🔥 Phát sự kiện "newAdminRegistered"
        eventEmitter.emit("newAdminRegistered", newAdmin);

        res.status(201).json({ message: 'Tạo tài khoản admin thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};


// Đăng nhập người dùng
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) { // So sánh trực tiếp mật khẩu
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }

        if (user.ban) {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa.' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
          const userData = {
            fullName: user.fullName,
            email: user.email,
            role: user.role
        };

        // Ghi log token và thông tin người dùng
        console.log("User logged in:", userData);
        console.log("Generated Token:", token);


        res.json({ message: 'Đăng nhập thành công!', token, user: { fullName: user.fullName, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
    try {
        const { fullName, phone, address } = req.body;
        const userId = req.user.userId; // Lấy userId từ token

        const updatedUser = await User.findByIdAndUpdate(userId, { fullName, phone, address }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        res.json({ message: 'Cập nhật thành công!', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};


// API chỉnh sửa thông tin người dùng (cho admin)
exports.updateUserByAdmin = async (req, res) => {
    try {
        const { userId } = req.params; // Nhận userId từ tham số URL
        const { fullName, email, phone, role, ban, address } = req.body; // Nhận các thông tin chỉnh sửa

        const existingUser = await User.findById(userId);
        
        if (!existingUser) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        // Cập nhật thông tin người dùng
        existingUser.fullName = fullName || existingUser.fullName;
        existingUser.email = email || existingUser.email;
        existingUser.phone = phone || existingUser.phone;
        existingUser.role = role || existingUser.role;
        existingUser.ban = ban || existingUser.ban;
        existingUser.address = address || existingUser.address; // Cập nhật địa chỉ

        await existingUser.save();

        res.json({ message: 'Cập nhật thông tin người dùng thành công!', user: existingUser });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};



// API xóa người dùng (cho admin)
exports.deleteUserByAdmin = async (req, res) => {
    try {
        const { userId } = req.params; // Nhận userId từ tham số URL

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng để xóa.' });
        }

        res.json({ message: 'Người dùng đã bị xóa thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};

// API lấy thông tin người dùng (yêu cầu token)
exports.getUserById = async (req, res) => {
    try {
        // Lấy userId từ token (req.user.userId đã được thêm vào sau khi xác thực token)
        const userId = req.user.userId;

        // Tìm người dùng trong cơ sở dữ liệu dựa trên userId từ token
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        res.json({ message: 'Lấy thông tin người dùng thành công!', user });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};


// API cập nhật ảnh đại diện người dùng
exports.updateAvatar = async (req, res) => {
  try {
    // Kiểm tra xem có token trong header không
    const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header

    if (!token) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
    }

    // Xác thực token và lấy userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }

    // Kiểm tra xem có file ảnh trong yêu cầu không
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng tải lên ảnh đại diện.' });
    }

    // Upload ảnh lên Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'user_avatars', // Thư mục trên Cloudinary dành riêng cho ảnh đại diện người dùng
        },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      ).end(req.file.buffer);  // Sử dụng buffer của file tải lên
    });

    // Lấy URL của ảnh từ Cloudinary
    const avatarUrl = result.secure_url;

    // Cập nhật URL ảnh đại diện vào cơ sở dữ liệu
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }

    res.json({
      message: 'Cập nhật ảnh đại diện thành công!',
      avatar: avatarUrl,
      user: updatedUser,
    });
  } catch (error) {
    // Kiểm tra lỗi xác thực token
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ.' });
    }

    // Lỗi server hoặc Cloudinary
    res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
  }
};

// API lấy ảnh đại diện người dùng
exports.getAvatar = async (req, res) => {
  try {
    // Lấy userId từ token (req.user.userId đã được thêm vào sau khi xác thực token)
    const userId = req.user.userId;

    // Tìm người dùng trong cơ sở dữ liệu dựa trên userId từ token
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }


    // Trả về URL ảnh đại diện
    res.json({
      message: 'Lấy ảnh đại diện thành công!',
      avatar: user.avatar,  // URL ảnh avatar
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
  }
};


