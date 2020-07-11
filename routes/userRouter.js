const express = require("express");
const authController = require("../controllers/authController");
const isAuth = require("../middlewares/isAuth");
const userController = require("../controllers/userController");
const router = express.Router();

//routes for login

router.post("/login", authController.postLogin);

// routes for signing in new user

// routes for signed in user
router.post("/update-user", isAuth, userController.postUpdateUser);

module.exports = router;
