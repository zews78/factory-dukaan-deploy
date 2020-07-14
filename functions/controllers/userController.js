const firebase = require('../firebase');
// const validator = require('validator');

exports.getUserProfile = (req, res) => {
	res.render('../views/user/profile.hbs', {auth: true});
};

exports.postUpdateUser = async(req, res) => {
	try {
		await firebase
			.firestore()
			.collection('users')
			.doc(req.uid)
			.update(req.body);
		res.redirect('/login');
	} catch (err) {
		console.log(err);
	}
};
