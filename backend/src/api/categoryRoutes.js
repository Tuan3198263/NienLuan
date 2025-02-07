const express = require("express");
const catetoryController = require("../controller/categoryController");

const router = express.Router();

// Route tạo danh mục mới
router.post("/", catetoryController.createCategory);

// Route lấy danh sách danh mục
router.get("/", catetoryController.getAllCategories);

// Route lấy tên tất cả danh mục
router.get('/all-names', catetoryController.getCategoryNames);

// Route cập nhật danh mục
router.put("/:id", catetoryController.updateCategory);

// Route xóa danh mục
router.delete("/:id", catetoryController.deleteCategory);

module.exports = router;
