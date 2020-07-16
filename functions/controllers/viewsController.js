// This file contains all GET controllers for frontend testing

exports.getLogin = (req, res) => {
	res.render('auth/login.ejs');
};

exports.getLogin2 = (req, res) => {
	res.render('auth/login2.ejs');
};

exports.getHome = (req, res) =>{
	res.render('main/home.ejs');
};
exports.getProducts = (req, res) =>{
	res.render('main/products.ejs');
};

exports.getUserProfile = (req, res) => {
	res.render('user/profile.ejs');
};

exports.getContacts = (req, res) => {
	res.render('../views/main/contact.hbs');
};
// Signup is not needed
// exports.getSignUp = (req, res) => {
// 	res.render('signup.ejs');
// };
