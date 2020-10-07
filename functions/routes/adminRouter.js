const express = require('express');
const adminController = require('../controllers/adminController');


const router = express.Router();

router.get('/', adminController.getDashboard);
router.get('/faq', adminController.getFaq);
router.post('/addfaq', adminController.createFaq);
router.post('/editfaq', adminController.editFaq);
router.delete('/faq', adminController.deleteFaq);

router.get('/query', adminController.getQuery);
router.delete('/query', adminController.deleteQuery);
router.post('/query/update-status', adminController.postUpdateStatus);

router.get('/requirements', adminController.getReq);
router.delete('/requirements', adminController.deleteReq);


router.get('/products', adminController.getProducts);
router.get('/product/:productId', adminController.getPrdouctDetails);
router.post('/editProduct', adminController.editProductDetails);



router.get('/users', adminController.getUsers);
router.get('/user/:userId', adminController.getUserDetails);
router.post('/user/:userId/block', adminController.postBlockUser);
router.delete('/user/:userId', adminController.deleteUser);
router.post('/user/:userId/update-subscription', adminController.postUpdateSubscription);
router.get('/pending-gst-verifications', adminController.getPendingGstVerifications);
router.get('/pending-gst-verification/:requestId', adminController.getPendingGstVerification);
router.post('/pending-gst-verification/:requestId/verify', adminController.postVerifyPendingGstVerification);

module.exports = router;
