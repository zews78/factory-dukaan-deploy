const firebase = require('../firebase');

exports.getLogin = (req, res) => {
	res.render('auth/login.ejs');
};

exports.postLogin = async(req, res) => {
	console.log(req.body);
	if (req.body.additionalUserInfo.isNewUser) {
		// Create a new user
		const userData = {};
		const uid = req.body.user.uid;
		userData.mobile = req.body.user.phoneNumber;
		firebase.firestore().collection('users').doc(uid).set(userData);
	} else {
		// Login
		console.log('for login');
	}
	res.json({message: 'Success'});
};

exports.signUp = (req, res) => {
	res.render('auth/signup.ejs');
};