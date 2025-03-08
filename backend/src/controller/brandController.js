const cloudinary = require('cloudinary').v2;
const Brand = require('../models/brand');
const Category = require('../models/category');
const Product = require('../models/product')

// Lấy danh sách tất cả thương hiệu
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching brands', error: err });
  }
};

// Lấy tên tất cả thương hiệu
exports.getBrandNames = async (req, res) => {
  try {
    // Lấy danh sách thương hiệu chỉ với trường 'name'
    const brands = await Brand.find({}, 'name');  // Truy vấn chỉ lấy trường 'name'
    
    // Trả về danh sách tên các thương hiệu
    res.status(200).json(brands);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách tên thương hiệu', error: err });
  }
};

// tạo thương hiệu mới
exports.createBrand = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Kiểm tra thông tin cơ bản
    if (!name || !description) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
    }

    // Kiểm tra xem file logo đã được tải lên chưa
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng tải lên một logo!' });
    }

    // Kiểm tra xem tên thương hiệu đã tồn tại trong cơ sở dữ liệu chưa
    const existingBrand = await Brand.findOne({ name: name.trim() });
    if (existingBrand) {
      return res.status(400).json({ message: 'Tên thương hiệu đã tồn tại, vui lòng chọn tên khác!' });
    }

    // Xử lý upload ảnh logo lên Cloudinary
    let logoUrl = '';  // Biến để lưu URL của logo

    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'my_pham_brands', // Thư mục trên Cloudinary dành riêng cho logo thương hiệu
          },
          (error, result) => {
            if (error) {
              reject(error);
            }
            resolve(result);
          }
        ).end(req.file.buffer);  // Sử dụng buffer của file (ảnh logo)
      });

      // Lấy URL ảnh từ Cloudinary sau khi upload thành công
      logoUrl = result.secure_url;
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi upload logo lên Cloudinary', error });
    }

    // Tạo thương hiệu mới
    const brand = new Brand({
      name,
      logo: logoUrl,  // Lưu URL của logo vào trường logo
      description,
    });

    // Lưu thương hiệu vào MongoDB
    await brand.save();
    res.status(201).json({ message: 'Thương hiệu đã được tạo!', brand });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};


/// Cập nhật thương hiệu
exports.updateBrand = async (req, res) => {
  try {
    const { brandId } = req.params;  // Lấy brandId từ params
    const { name, description } = req.body;

    // Kiểm tra xem thương hiệu có tồn tại không
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ message: 'Thương hiệu không tìm thấy!' });
    }

    // Kiểm tra tên thương hiệu có bị trùng không
    if (name) {
      const existingBrand = await Brand.findOne({ name: name });
      if (existingBrand && existingBrand._id.toString() !== brandId) {
        return res.status(400).json({ message: 'Tên thương hiệu đã tồn tại!' });
      }
      brand.name = name;  // Cập nhật tên nếu không bị trùng
    }

    // Cập nhật mô tả nếu có thay đổi
    if (description) brand.description = description;

    // Kiểm tra nếu có ảnh logo mới được tải lên
    if (req.files && req.files.length > 0) {
      // Xử lý upload ảnh logo mới lên Cloudinary
      let logoUrl = '';
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'image',
              folder: 'my_pham_brands', // Thư mục trên Cloudinary dành riêng cho logo thương hiệu
            },
            (error, result) => {
              if (error) {
                reject(error);
              }
              resolve(result);
            }
          ).end(req.files[0].buffer);  // Sử dụng buffer của file (ảnh logo mới)
        });

        // Lấy URL ảnh từ Cloudinary sau khi upload thành công
        logoUrl = result.secure_url;

        // Cập nhật URL logo mới
        brand.logo = logoUrl;
      } catch (error) {
        return res.status(500).json({ message: 'Lỗi khi upload logo lên Cloudinary', error });
      }
    }

    // Lưu các thay đổi vào MongoDB
    await brand.save();
    res.status(200).json({ message: 'Thương hiệu đã được cập nhật!', brand });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// xóa thương hiệu
exports.deleteBrand = async (req, res) => {
  try {
    const { brandId } = req.params;  // Lấy brandId từ params

    // Kiểm tra xem thương hiệu có tồn tại không
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ message: 'Thương hiệu không tìm thấy!' });
    }

    // Kiểm tra xem thương hiệu có sản phẩm nào không
    const productsWithBrand = await Product.find({ brand }); // Tìm sản phẩm có brandId này
    if (productsWithBrand.length > 0) {
      return res.status(400).json({ message: 'Không thể xóa thương hiệu vì đã có sản phẩm liên kết!' });
    }

    // Xóa thương hiệu khỏi MongoDB
    await Brand.findByIdAndDelete(brandId);  // Thay vì brand.remove()
    res.status(200).json({ message: 'Thương hiệu đã được xóa thành công!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};


// API lấy danh sách thương hiệu theo danh mục
exports.getBrandsByCategory = async (req, res) => {
  try {
    const categorySlug = req.params.categorySlug;

    // Tìm danh mục theo slug
    const category = await Category.findOne({ slug: categorySlug });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Lấy tất cả các sản phẩm trong danh mục
    const products = await Product.find({ category: category._id }).populate('brand');

    // Lấy danh sách các thương hiệu từ các sản phẩm (loại bỏ trùng lặp)
    const brands = [...new Set(products.map(product => product.brand._id.toString()))];

    // Truy vấn các thương hiệu từ database
    const brandDetails = await Brand.find({
      _id: { $in: brands }
    });

    res.status(200).json(brandDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBrandsByProductKeyword = async (req, res) => {
  try {
    const { keyword } = req.query; // Lấy từ khóa tìm kiếm từ query string

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm!" });
    }

    // Tìm các sản phẩm có tên hoặc mô tả chứa từ khóa
    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } }, // Tìm theo tên sản phẩm
      ]
    }).populate("brand"); // Populate để lấy thông tin brand liên kết

    // Lấy danh sách các thương hiệu (loại bỏ trùng lặp)
    const brandIds = [...new Set(products.map(product => product.brand._id.toString()))];

    // Truy vấn thông tin chi tiết của các thương hiệu
    const brands = await Brand.find({
      _id: { $in: brandIds }
    });

    res.status(200).json(brands); // Trả về danh sách thương hiệu
  } catch (error) {
    console.error("Lỗi khi tìm kiếm thương hiệu:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};




