const express = require('express');
const router = express.Router();
const brandController = require('../controller/brandController');
const upload = require('../config/multerConfig');



router.get('/', brandController.getAllBrands);
// Middleware Multer để xử lý việc upload ảnh

// Route lấy tên tất cả thương hiệu
router.get('/all-names', brandController.getBrandNames);

router.post('/', upload.single('logo'), brandController.createBrand); // 'logo' là tên trường trong form-data của Postman
// Cập nhật thương hiệu
router.put('/:brandId',upload.single('logo'), brandController.updateBrand);
//xóa
router.delete('/:brandId', brandController.deleteBrand); // Xóa thương hiệu

// Đảm bảo rằng đường dẫn API phù hợp
router.get('/brands-by-category/:categorySlug', brandController.getBrandsByCategory);

// Định nghĩa API tìm kiếm thương hiệu
router.get('/search', brandController.getBrandsByProductKeyword);


module.exports = router;
