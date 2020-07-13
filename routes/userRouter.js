const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/profile', userController.getUserProfile);
router.patch('/', userController.patchUser);

module.exports = router;
