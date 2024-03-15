const express = require('express');
const viewsController = require('../controllers/viewsController');
const router = express.Router();

// This file contains all GET routes for frontend testing

// authRoutes
router.get('/login', viewsController.getLogin);
router.get('/login2', viewsController.getLogin2);
router.get('/user/profile', viewsController.getUserProfile);
router.get('/payment/:id', viewsController.getUserPayment);

// mainRoutes
router.get('/', viewsController.getHome);
router.get('/products', viewsController.getProducts);
router.get('/contact-us', viewsController.getContacts);
module.exports = router;