const firebase = require('../firebase');
const isAuth = require('./isAuth');

module.exports = async(req) => {
	try {
		const [auth, decodedToken] = await isAuth(req);
		if (auth) {
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
