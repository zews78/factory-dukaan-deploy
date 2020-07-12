const firebase = require('../firebase');

module.exports = async(req) => {
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