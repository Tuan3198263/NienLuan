const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');

router.get('/', dashboardController.getDashboardStats);

module.exports = router;