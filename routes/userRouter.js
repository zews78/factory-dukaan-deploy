const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/update', userController.postUpdateUser);

module.exports = router;
