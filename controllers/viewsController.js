// This file contains all GET controllers for frontend testing

exports.getLogin = (req, res) => {
	res.render('../views/login.hbs');
};

exports.getLogin2 = (req, res) => {
	res.render('../views/login2.hbs');
};

exports.getHome = (req, res) =>{
	res.render('../views/home.hbs');
};

// Signup is not needed
// exports.getSignUp = (req, res) => {
// 	res.render('../views/signup.hbs');
// };
