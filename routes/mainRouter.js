const express = require('express');
const mainController = require('../controllers/mainController');

const router = express.Router();

router.get('/home', mainController.getHome);

module.exports = router;
