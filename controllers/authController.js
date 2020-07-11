const firebase = require('../firebase');

const loginPageNumber = async(req) => {
	try {
		let token = req.cookies['firebase-jwt-token'];
		if (token) {
			token = token.substring('Bearer '.length);
			const decodedToken = await firebase.auth().verifyIdToken(token);
			const user = await firebase.firestore().collection('users').doc(decodedToken.uid).get();
			console.log(user.data());
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
	console.log(page);
	if (page === 3) {
		res.redirect('/home');
	} else {
		res.render('../views/login.hbs', {page});
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
