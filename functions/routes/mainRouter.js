const express = require('express');
const mainController = require('../controllers/mainController');
const isAuth = require('../middlewares/isAuth');

const router = express.Router();

router.get('/', mainController.getHome);
router.get('/help', mainController.getHelp);
// router.get('/contact-us', mainController.getContacts);
router.get('/plan-details', mainController.getPlanDetails);
router.get('/products', mainController.getProducts);
router.get('/product/:productId', isAuth, mainController.getOneProduct);
router.post('/products', isAuth, mainController.postProduct);
router.post('/product/:productId/update', isAuth, mainController.postUpdateProduct);
router.post('/querySubmit', mainController.postQuery);


module.exports = router;
