const express = require('express');

const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/', adminController.getDashboard);
router.get('/products', adminController.getProducts);

module.exports = router;
