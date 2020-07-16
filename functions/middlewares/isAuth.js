const isAuth = require('../utils/isAuth');
const firebase = require('../firebase');

module.exports = async(req, res, next) => {
	const [auth, decodedToken] = await isAuth(req);
	if (auth) {
		req.uid = decodedToken.uid;
		req.gstVerification = false;
		const userData = await firebase.firestore()
			.collection('users')
			.doc(req.uid)
			.get();
		if(userData.data().gstNo) {
			req.gstVerification = true;
		}
		next();
	} else {
		res.redirect('/login');
	}
};