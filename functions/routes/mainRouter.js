const express = require('express');
const mainController = require('../controllers/mainController');
const isAuth = require('../middlewares/isAuth');
const redirectTo = require('../middlewares/redirectTo');

const router = express.Router();

router.get('/', mainController.getHome);
router.get('/help', mainController.getHelp);
router.get('/contact-us', mainController.getContacts);
router.get('/pricing', mainController.getPlanDetails);
router.get('/products', mainController.getProducts);
router.get('/product/:productId', redirectTo, isAuth, mainController.getOneProduct);
router.post('/products', isAuth, mainController.postProduct);
router.post('/product/:productId/update', isAuth, mainController.postUpdateProduct);
router.post('/querySubmit', isAuth, mainController.postQuery);


// REQUIREMENTS PAGE
router.get('/requirement', mainController.getRequirement);
router.post('/addreq', isAuth, mainController.postAddRequirement);
router.get('/requirement/:reqId', redirectTo, isAuth, mainController.getOneRequirement);
router.post('/requirement/:reqId/bid/', isAuth, mainController.postBid);


module.exports = router;
