const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/profile', userController.getUserProfile);
router.post('/profile/update', userController.postUpdateUser);
router.post('/verify-gst', userController.postVerifyGst);

module.exports = router;
