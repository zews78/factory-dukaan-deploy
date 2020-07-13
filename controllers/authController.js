const firebase = require('../firebase');

const loginPageNumber = require('../utils/loginPageNumber');

exports.getLogin = async(req, res) => {
	const page = await loginPageNumber(req);
	if (page === 1) {
		res.render('../views/auth/login.hbs');
	} else if (page === 2) {
		res.render('../views/auth/login2.hbs');
	} else {
		res.redirect('/');
	}
};

exports.postLogin = async(req, res) => {
	if (req.body.additionalUserInfo.isNewUser) {
		// Create a new user
		const userData = {};
		const uid = req.body.user.uid;
		userData.mobile = req.body.user.phoneNumber;
		firebase.firestore().collection('users').doc(uid).set(userData);
	}
	res.cookie(
		'firebase-jwt-token',
		'Bearer ' + req.body.user.stsTokenManager.accessToken,
		{httpOnly: true}
	);
	res.redirect('/login');
};

exports.logout = async(req, res) => {
	res.cookie('firebase-jwt-token', 'loggedout', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true
	});
	console.log('successfully logged out');
	res.redirect('/');
};
