const express = require('express');
const mainController = require('../controllers/mainController');
const isAuth = require('../middlewares/isAuth');

const router = express.Router();

router.get('/', mainController.getHome);
router.get('/products', mainController.getProducts);
router.post('/products/create', isAuth, mainController.postCreateProduct);

module.exports = router;
