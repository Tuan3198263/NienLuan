const Category = require("../models/Category");

// Tạo danh mục mới
exports.createCategory = async (req, res) => {
  const { name, parentId, description, status } = req.body;

  try {
    const newCategory = new Category({
      name,
      parentId,
      description,
      status,
    });

    await newCategory.save();

    res.status(201).json({
      message: "Danh mục được tạo thành công!",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tạo danh mục!",
      error: error.message,
    });
  }
};

// Lấy danh sách danh mục
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách danh mục!",
      error: error.message,
    });
  }
};

// Sửa danh mục
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, parentId, description, status } = req.body;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, parentId, description, status },
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
