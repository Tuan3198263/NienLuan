const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const upload = require('../config/multerConfig');

// Route lấy danh sách sản phẩm
router.get('/', productController.getAllProducts);

// Route thêm sản phẩm mới với upload ảnh
router.post('/', upload.array('images', 5), productController.createProduct);

// Route chỉnh sửa sản phẩm
router.put('/:productId', upload.array('images', 5), productController.updateProduct);

// Route chỉnh sửa trạng thái active của sản phẩm
router.patch('/:productId/active', productController.toggleActiveStatus);

// Route xóa sản phẩm
router.delete('/:productId', productController.deleteProduct);

module.exports = router;
