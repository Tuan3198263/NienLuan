const express = require("express");
const categoryController = require("../controller/categoryController");

const router = express.Router();

// Route tạo danh mục mới(admin)
router.post("/", categoryController.createCategory);

// Route lấy danh sách danh mục(admin)
router.get("/", categoryController.getAllCategories);

// Route lấy tên tất cả danh mục
router.get('/all-names', categoryController.getCategoryNames);

// Route cập nhật danh mục(admin)
router.put("/:id", categoryController.updateCategory);

// Route xóa danh mục(admin)
router.delete("/:id", categoryController.deleteCategory);


// 🟠 Lấy danh mục theo slug
router.get("/slug/:slug", categoryController.getCategoryBySlug);



module.exports = router;
