const Category = require("../models/category");
const slugify = require("slugify");
const Brand = require("../models/brand")
const Product = require("../models/product")

exports.createCategory = async (req, res) => {
  const { name, description, status } = req.body;

  try {
    const newCategory = new Category({
      name,
      description,
      status,
    });

    await newCategory.save();
    res.status(201).json({
      message: "Danh mục được tạo thành công!",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error); // Log lỗi chi tiết
    res.status(500).json({
      message: "Lỗi khi tạo danh mục!",
      error: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, status },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục!" });
    }

    res.status(200).json({
      message: "Danh mục được cập nhật thành công!",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật danh mục!",
      error: error.message,
    });
  }
};


exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra xem danh mục có sản phẩm hay không
    const categoryWithProducts = await Product.findOne({ category: id });
    if (categoryWithProducts) {
      return res.status(400).json({
        message: "Không thể xóa danh mục này vì nó đang chứa sản phẩm.",
      });
    }

    // Nếu không có sản phẩm trong danh mục, thực hiện xóa danh mục
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục!" });
    }

    res.status(200).json({
      message: "Danh mục đã được xóa thành công!",
      category: deletedCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa danh mục!",
      error: error.message,
    });
  }
};


exports.getAllCategories = async (req, res) => {
  try {
    // Lấy tất cả danh mục từ cơ sở dữ liệu mà không cần phân cấp
    const categories = await Category.find();

    // Trả về tất cả các danh mục
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách danh mục!",
      error: error.message,
    });
  }
};

// Lấy tên tất cả danh mục có trạng thái "active"
exports.getCategoryNames = async (req, res) => {
  try {
    // Chỉ lấy danh mục có status = "active" và chỉ lấy trường 'name' và 'slug'
    const categories = await Category.find({ status: "active" }, "name slug");

    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách tên danh mục",
      error: err.message,
    });
  }
};


exports.getCategoryBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục!" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh mục!",
      error: error.message,
    });
  }
};



