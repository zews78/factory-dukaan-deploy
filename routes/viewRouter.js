const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

// This file contains all GET routes for frontend testing

// authRoutes
router.get('/login', viewsController.getLogin);

// mainRoutes
router.get('/', viewsController.getHome);
router.get('/buyer', viewsController.buyProducts);


module.exports = router;
