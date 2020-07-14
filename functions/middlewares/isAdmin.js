const firebase = require('../firebase');
const isAuth = require('../utils/isAuth');

module.exports = async(req, res, next) => {
	const [auth, decodedToken] = await isAuth(req);
	if (auth) {
		const user = await firebase.firestore()
			.collection('users')
			.doc(decodedToken.uid)
			.get();
		if (user.data().role === 'admin') {
			next();
		} else {
			res.redirect('/');
		}
	} else {
		res.redirect('/login');
	}
};
