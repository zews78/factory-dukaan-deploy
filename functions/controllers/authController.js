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
	try {

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
		const expiresIn = 1000 * 60 * 60 * 24 * 14;
		const sessionCookie = await firebase.auth()
			.createSessionCookie(req.body.user.stsTokenManager.accessToken, {expiresIn});
		const cookieOptions = {
			maxAge: expiresIn,
			httpOnly: true,
			secure: true
		};
		res.cookie('session', sessionCookie, cookieOptions);
		res.redirect('/login');
	} catch(err) {
		console.log(err);
		res.status(500)
			.json({message: 'Something went wrong!'});
	}
};

exports.postLogout = async(req, res) => {
	try {
		res.clearCookie('session');
		await firebase.auth()
			.revokeRefreshTokens(req.uid);
		res.redirect('/');
	} catch (err) {
		res.redirect('/login');
	}
};
