// This file contains all GET controllers for frontend testing

exports.getLogin = async(req, res) => {
	res.render('../views/login.hbs');
};

exports.getHome = (req, res) =>{
	res.render('../views/home.hbs');
};
exports.buyProducts = (req, res) =>{
	res.render('../views/buy.hbs');
};
// Signup is not needed
// exports.getSignUp = (req, res) => {
// 	res.render('../views/signup.hbs');
// };
