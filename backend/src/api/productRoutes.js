const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const upload = require('../config/multerConfig');

// Route lấy danh sách sản phẩm (tất cả)
router.get('/', productController.getAllProducts);

// Route thêm sản phẩm mới với upload ảnh(admin)
router.post('/', upload.array('images', 5), productController.createProduct);

// Route chỉnh sửa sản phẩm(admin)
router.put('/:productId', upload.array('images', 5), productController.updateProduct);

// Route chỉnh sửa trạng thái active của sản phẩm(admin)
router.patch('/:productId/active', productController.toggleActiveStatus);

// Route xóa sản phẩm(admin)
router.delete('/:productId', productController.deleteProduct);


// Route lấy danh sách sản phẩm theo slug danh mục
router.get('/list/category/slug/:slug', productController.getProductsByCategorySlug);

// API lấy thông tin chi tiết sản phẩm theo slug
router.get('/product-slug/:slug', productController.getProductBySlug);

// Route tìm kiếm sản phẩm
router.get('/search', productController.searchProducts);

// Route lấy sản phẩm theo brandId
router.get('/get-by-brand/:brandId', productController.getProductsByBrandId);

module.exports = router;
