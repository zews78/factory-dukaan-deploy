// This file contains all GET controllers for frontend testing

exports.getLogin = (req, res) => {
	res.render('../views/auth/login.hbs');
};

exports.getLogin2 = (req, res) => {
	res.render('../views/auth/login2.hbs');
};

exports.getHome = (req, res) =>{
	res.render('../views/main/home.hbs');
};
exports.getProducts = (req, res) =>{
	res.render('../views/main/products.hbs');
};

exports.getUserProfile = (req, res) => {
	res.render('../views/user/profile.hbs');
};
exports.getUserPayment = (req, res) => {
	res.render('../views/user/payment.hbs');
};

// Signup is not needed
// exports.getSignUp = (req, res) => {
// 	res.render('../views/signup.hbs');
// };
