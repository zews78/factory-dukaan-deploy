const firebase = require('../firebase');

const loginPageNumber = async(req) => {
	try {
		let token = req.cookies['firebase-jwt-token'];
		if (token) {
			token = token.substring('Bearer '.length);
			const decodedToken = await firebase.auth().verifyIdToken(token);
			const user = await firebase
				.firestore()
				.collection('users')
				.doc(decodedToken.uid)
				.get();
			if (user.data().name) {
				return 3;
			} else {
				return 2;
			}
		} else {
			return 1;
		}
	} catch (err) {
		return 1;
	}
};

exports.getLogin = async(req, res) => {
	const page = await loginPageNumber(req);
	if (page === 3) {
		res.redirect('/');
	} else if (page == 2) {
		res.render('../views/login2.hbs');
	} else {
		res.render('../views/login.hbs');
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
