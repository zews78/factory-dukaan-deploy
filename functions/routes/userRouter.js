const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/profile', userController.getUserProfile);
router.get('/:userId/profile', userController.getUserProfile);
router.post('/profile/update', userController.postUpdateUser);
router.post('/verify-gst', userController.postVerifyGst);
router.post('/profile-pic', userController.postUpdateProfilePic);

// Seller profile
router.get('/seller-profile/:userId', userController.getSellerProfile);


// SELL PAGE
router.get('/sell', userController.getSellingPage);
router.post('/deleteProduct', userController.deleteProduct);
router.post('/updateProduct', userController.updateProduct);
router.post('/sellProduct', userController.sellProduct);

// REVIEW HANDLER
router.post('/review/:productId', userController.postReview);

// PAYMENT ROUTES
router.get('/payment', userController.getUserPayment);
router.get('/payment/validity', userController.getPlanValidities);
router.post('/payment/verify', userController.paymentVerification);
router.get('/paymentSuccess', userController.getSuccessfulPayment);

module.exports = router;
