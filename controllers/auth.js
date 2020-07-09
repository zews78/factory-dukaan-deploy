// const firebase = require('../firebase');

exports.getLogin = (req, res) => {
	res.render('auth/login.ejs');
};

exports.postLogin = (req, res) => {
	console.log(req.body);
	res.json({message: 'Success'});
};

exports.signUp = (req, res) => {
	res.render('auth/signup.ejs');
};