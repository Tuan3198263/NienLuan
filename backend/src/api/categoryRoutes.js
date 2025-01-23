const express = require("express");
const catetoryController = require("../controller/categoryController");

const router = express.Router();

// Route tạo danh mục mới
router.post("/", catetoryController.createCategory);

// Route lấy danh sách danh mục
router.get("/", catetoryController.getCategories);

// Route cập nhật danh mục
router.put("/:id", catetoryController.updateCategory);

// Route xóa danh mục
router.delete("/:id", catetoryController.deleteCategory);

module.exports = router;
