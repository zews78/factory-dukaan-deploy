const firebase = require('../firebase');

const loginPageNumber = require('../utils/loginPageNumber');

exports.getLogin = async(req, res) => {
	const page = await loginPageNumber(req);
	if (page === 1) {
		res.render('../views/auth/login.hbs', {auth: false});
	} else if (page === 2) {
		res.render('../views/auth/login2.hbs', {auth: true});
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
		firebase.firestore()
			.collection('users')
			.doc(uid)
			.set(userData);
	}
	res.cookie(
		'firebase-jwt-token',
		'Bearer ' + req.body.user.stsTokenManager.accessToken,
		{httpOnly: true}
	);
	res.redirect('/login');
};

exports.postLogout = async(req, res) => {
	res.clearCookie('firebase-jwt-token');
	res.redirect('/');
};
