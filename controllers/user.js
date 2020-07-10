const firebase = require('../firebase');

exports.postUpdateUser = async(req, res) => {
	try {
		const userData = {...req.body};
		for (let property in userData)
			if (userData[property] == null || userData[property] == '' || userData[property] == undefined || userData[property] == {} || userData[property] == [])
				delete userData[property];
		console.log(req.uid);
		await firebase.firestore().collection('users').doc(req.uid).update(userData);
		res.redirect('/login');
	} catch (err) {
		console.log(err);
	}
};