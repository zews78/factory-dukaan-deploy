// This file contains all GET controllers for frontend testing

exports.getLogin = async(req, res) => {
	res.render('../views/login.hbs');
};

exports.getHome = (req, res) =>{
	res.render('../views/home.hbs');
};

// Signup is not needed
// exports.getSignUp = (req, res) => {
// 	res.render('../views/signup.hbs');
// };
