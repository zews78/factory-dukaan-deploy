const express = require('express');
const adminController = require('../controllers/adminController');


const router = express.Router();

router.get('/', adminController.getDashboard);
router.get('/products', adminController.getProducts);
router.get('/users', adminController.getUsers);
router.get('/product-details', adminController.getPrdouctDetails);
router.get('/user-details', adminController.getUserDetails);

module.exports = router;
