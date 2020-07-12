const firebase = require('../firebase');

module.exports = async(req) => {
	try {
		let token = req.cookies['firebase-jwt-token'];
		if (token) {
			token = token.substring('Bearer '.length);
			const decodedToken = await firebase.auth().verifyIdToken(token);
			return [true, decodedToken];
		} else {
			return [false, {}];
		}
	} catch (err) {
		return [false, {}];
	}
};