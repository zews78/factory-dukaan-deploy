const express = require('express');
const mainController = require('../controllers/mainController');

const router = express.Router();

router.get('/', mainController.getHome);
router.get('/products', mainController.getProducts);

module.exports = router;
