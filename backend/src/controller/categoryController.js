const Category = require("../models/category");

exports.createCategory = async (req, res) => {
  const { name, parentCategory, description, status } = req.body;

  try {
   

    const newCategory = new Category({
      name,
      parentCategory,
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
  const { name, parentCategory, description, status } = req.body; // Thay đổi từ parentId thành parentCategory

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, parentCategory, description, status }, // Sử dụng parentCategory thay vì parentId
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

// Xóa danh mục
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
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

// Lấy tên tất cả danh mục
exports.getCategoryNames = async (req, res) => {
  try {
    // Lấy tất cả danh mục chỉ với trường 'name'
    const categories = await Category.find({}, 'name');  // Truy vấn chỉ lấy trường 'name'
    
    // Trả về danh sách tên các danh mục
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách tên danh mục', error: err.message });
  }
};



