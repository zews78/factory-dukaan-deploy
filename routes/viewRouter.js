const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

// Log in page
router.get('/users/login', viewsController.getLogin);

// Sign up page
router.get('/users/signup', viewsController.getSignUp);

// Home page
router.get('/home', viewsController.goHome);

module.exports = router;
