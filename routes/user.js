const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

router.post('/update-user', userController.postUpdateUser);

module.exports = router;
