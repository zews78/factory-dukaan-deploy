const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/profile', userController.getUserProfile);
router.get('/:userId/profile', userController.getUserProfile);
router.post('/profile/update', userController.postUpdateUser);
router.post('/verify-gst', userController.postVerifyGst);


// SELL PAGE
router.get('/sell', userController.getSellingPage);
router.post('/deleteProduct', userController.deleteProduct);
router.post('/updateProduct', userController.updateProduct);
router.post('/sellProduct', userController.sellProduct);

// PAYMENT ROUTES
router.get('/payment', userController.getUserPayment);
router.post('/payment/verify', userController.paymentVerification);
router.get('/paymentSuccess', userController.getSuccessfulPayment);

module.exports = router;
