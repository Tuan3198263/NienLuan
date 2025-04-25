const express = require('express');
const router = express.Router();
const brandController = require('../controller/brandController');
const upload = require('../config/multerConfig');

// Đặt các tuyến đường tĩnh trước
router.get('/search', brandController.getBrandsByProductKeyword);
router.get('/all-names', brandController.getBrandNames);
router.get('/brands-by-category/:categorySlug', brandController.getBrandsByCategory);

// Đặt tuyến đường động sau
router.get('/:brandId', brandController.getBrandById);

// Các tuyến đường khác
router.get('/', brandController.getAllBrands);//(admin)
router.post('/', upload.single('logo'), brandController.createBrand); //(admin)
router.put('/:brandId', upload.single('logo'), brandController.updateBrand); //(admin)
router.delete('/:brandId', brandController.deleteBrand); //(admin)

module.exports = router;
