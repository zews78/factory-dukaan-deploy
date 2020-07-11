const express = require("express");
const viewsController = require("../controllers/viewsController");
const authController = require("../controllers/authController");
const viewsHome = require("../controllers/viewsController");



const router = express.Router();

// Log in page
router.get("/login", viewsController.getLogin);

router.post('/login', authController.postLogin);
// Sign up page
router.get("/users/signup", viewsController.getSignUp);
router.get("/home", viewsHome.getSignUp);


module.exports = router;
