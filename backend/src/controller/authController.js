const jwt = require('jsonwebtoken');
const User = require('../models/user');
const cloudinary = require('cloudinary').v2;


// API lấy tất cả người dùng
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); // Lấy tất cả người dùng trong cơ sở dữ liệu
        res.json({ message: 'Lấy tất cả người dùng thành công!', users });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};


// Đăng ký người dùng
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body; // Bỏ address
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng.' });
        }

        const newUser = new User({ fullName, email, password, phone });
        await newUser.save();

        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};



// Đăng ký Admin với mã xác thực
exports.registerAdmin = async (req, res) => {
    try {
        const { fullName, email, password, phone, verificationCode } = req.body; // Mã xác thực từ đầu vào

        const validVerificationCode = process.env.ADMIN_VERIFICATION_CODE; // Mã xác thực lưu trong biến môi trường
        if (verificationCode !== validVerificationCode) {
            return res.status(400).json({ message: 'Mã xác thực không hợp lệ.' });
        }

        // Kiểm tra nếu email đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng.' });
        }

        // Tạo một người dùng mới với vai trò là "admin"
        const newUser = new User({ 
            fullName, 
            email, 
            password, 
            phone,
            role: 'admin' // Đặt vai trò là "admin"
        });

        // Lưu vào cơ sở dữ liệu
        await newUser.save();

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


