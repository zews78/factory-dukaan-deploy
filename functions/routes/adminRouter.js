const express = require('express');
const adminController = require('../controllers/adminController');


const router = express.Router();

router.get('/', adminController.getDashboard);
router.get('/products', adminController.getProducts);
router.get('/users', adminController.getUsers);
router.get('/product/:productId', adminController.getPrdouctDetails);
router.get('/user/:userId', adminController.getUserDetails);
router.post('/user/:userId/block', adminController.postBlockUser);
router.delete('/user/:userId', adminController.deleteUser);
router.post('/user/:userId/update-subscription', adminController.postUpdateSubscription);
router.get('/pending-gst-verifications', adminController.getPendingGstVerifications);
router.get('/pending-gst-verification/:userId', adminController.getPendingGstVerification);

module.exports = router;
