const express = require('express');
const mainController = require('../controllers/mainController');
const isAuth = require('../middlewares/isAuth');

const router = express.Router();

router.get('/', mainController.getHome);
router.get('/contact-us', mainController.getContacts);
router.get('/products', mainController.getProducts);
router.post('/products', isAuth, mainController.postProduct);
router.post('/products/:productId/update', isAuth, mainController.postUpdateProduct);

module.exports = router;
