const express = require('express');
const authController = require('../controllers/authController');
const isAuth = require('../middlewares/isAuth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.post('/logout', isAuth, authController.postLogout);

module.exports = router;
