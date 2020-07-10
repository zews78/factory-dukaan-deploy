const firebase = require('../firebase');

exports.getLogin = async(req, res) => {
	let token = req.cookies['firebase-jwt-token'];
	if (token) {
		token = token.substring('Bearer '.length);
	} else {
		console.log('jwt token not found');
	}
	res.render('auth/login.ejs');
};

exports.postLogin = async(req, res) => {
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
	res.cookie(
		'firebase-jwt-token',
		'Bearer ' + req.body.user.stsTokenManager.accessToken, {httpOnly: true}
	);
	res.redirect('/login');
};

exports.signUp = (req, res) => {
	res.render('auth/signup.ejs');
};
