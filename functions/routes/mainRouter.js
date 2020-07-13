const express = require('express');
const mainController = require('../controllers/mainController');
const isAuth = require('../middlewares/isAuth');

const router = express.Router();

router.get('/', mainController.getHome);
router.get('/products', mainController.getProducts);
router.post('/products', isAuth, mainController.postProduct);
router.patch('/products/:productId', isAuth, mainController.patchProduct);

module.exports = router;
