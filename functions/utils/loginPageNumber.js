const firebase = require('../firebase');
const isAuth = require('./isAuth');

module.exports = async(req) => {
	function randomString(chars) {
		var result = '';
		for (var i = 8; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
		return result;
	}
	try {
		const [auth, decodedToken] = await isAuth(req);
		if (auth) {
			const user = await firebase
				.firestore()
				.collection('users')
				.doc(decodedToken.uid)
				.get();
			if (user.data()) {
				if(user.data().name) {
					return 3;
				}else{
					return 2;
				}

			} else {
				await firebase.firestore()
					.collection('users')
					.doc(decodedToken.uid)
					.set({
						referralCode: randomString('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
						referredTo: 0
					});
				return 2;
			}
		} else {
			return 1;
		}
	} catch (err) {
		console.log(err);
		return 1;
	}
};
