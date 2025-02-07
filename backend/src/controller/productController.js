const Product = require('../models/product');
const cloudinary = require('../config/cloudinaryConfig');



// Lấy danh sách tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    // Lấy toàn bộ danh sách sản phẩm từ MongoDB, kèm theo dữ liệu liên kết từ Category và Brand
    const products = await Product.find()
      .populate('category', 'name') // Lấy thông tin tên danh mục từ collection Category
      .populate('brand', 'name') // Lấy thông tin tên thương hiệu từ collection Brand
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất

    // Trả về danh sách sản phẩm
    res.status(200).json({
      message: 'Danh sách tất cả sản phẩm',
      totalProducts: products.length, // Tổng số sản phẩm
      products, // Mảng chứa các sản phẩm
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};


// Thêm sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const { name, category, brand, price, description, ingredients, usage, stock, featured } = req.body;

    // Kiểm tra thông tin cơ bản
    if (!name || !category || !brand || !price || !description || !ingredients || !usage || stock == null) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
    }

    // Kiểm tra nếu không có ảnh nào được tải lên
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Vui lòng tải lên ít nhất một ảnh!' });
    }

    // Xử lý upload ảnh lên Cloudinary
    let imageUrls = [];
    for (const file of req.files) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'image',
              folder: 'my_pham', // Thư mục trên Cloudinary
            },
            (error, result) => {
              if (error) {
                reject(error);
              }
              resolve(result);
            }
          ).end(file.buffer);  // Sử dụng buffer của file
        });

        // Lấy URL ảnh từ Cloudinary sau khi upload thành công
        imageUrls.push(result.secure_url);
      } catch (error) {
        return res.status(500).json({ message: 'Lỗi khi upload ảnh lên Cloudinary', error });
      }
    }

    // Tạo sản phẩm mới
    const product = new Product({
      name,
      category,
      brand,
      price,
      images: imageUrls,  // Lưu URL ảnh vào mảng images
      description,
      ingredients,
      usage,
      stock,
      featured,
    });

    // Lưu sản phẩm vào MongoDB
    await product.save();
    res.status(201).json({ message: 'Sản phẩm đã được tạo!', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};


// Chỉnh sửa thông tin sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params; // Lấy productId từ URL params
    const { name, category, brand, price, description, ingredients, usage, stock } = req.body;

    // Kiểm tra xem sản phẩm có tồn tại trong database không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    // Cập nhật thông tin sản phẩm
    product.name = name || product.name;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.price = price || product.price;
    product.description = description || product.description;
    product.ingredients = ingredients || product.ingredients;
    product.usage = usage || product.usage;
    product.stock = stock || product.stock;
  

    // Kiểm tra nếu có ảnh mới được tải lên
    if (req.files && req.files.length > 0) {
      let imageUrls = [];
      for (const file of req.files) {
        try {
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                resource_type: 'image',
                folder: 'my_pham', // Thư mục trên Cloudinary
              },
              (error, result) => {
                if (error) {
                  reject(error);
                }
                resolve(result);
              }
            ).end(file.buffer); // Sử dụng buffer của file
          });

          // Lấy URL ảnh từ Cloudinary sau khi upload thành công
          imageUrls.push(result.secure_url);
        } catch (error) {
          return res.status(500).json({ message: 'Lỗi khi upload ảnh lên Cloudinary', error });
        }
      }
      // Cập nhật ảnh mới
      product.images = imageUrls;
    }

    // Lưu lại sản phẩm đã cập nhật
    await product.save();
    res.status(200).json({ message: 'Sản phẩm đã được cập nhật!', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// Chỉnh sửa trạng thái active (hoặc inactive) của sản phẩm
exports.toggleActiveStatus = async (req, res) => {
  try {
    const { productId } = req.params; // Lấy productId từ URL params
    const { active } = req.body; // Lấy trạng thái active từ request body

    // Kiểm tra xem sản phẩm có tồn tại trong database không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    // Cập nhật trạng thái active của sản phẩm
    product.active = active; // Cập nhật active với giá trị mới (true/false)

    // Lưu lại sản phẩm đã cập nhật
    await product.save();
    res.status(200).json({ message: 'Trạng thái sản phẩm đã được cập nhật!', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params; // Lấy productId từ URL params

    // Tìm và xóa sản phẩm trong database
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    res.status(200).json({ message: 'Sản phẩm đã được xóa!', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};