const firebase = require('../firebase');

module.exports = async(req, res, next) => {
	try {
		let token = req.cookies['firebase-jwt-token'];
		console.log('Token: ' + token);
		if (token) {
			token = token.substring('Bearer '.length);
			const decodedToken = await firebase.auth().verifyIdToken(token);
			console.log(decodedToken);
			req.uid = decodedToken.uid;
			next();
		} else {
			res.redirect('/login');
		}
	} catch (err) {
		res.redirect('/login');
	}
};