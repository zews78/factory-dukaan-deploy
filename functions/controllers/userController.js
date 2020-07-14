const firebase = require('../firebase');
const axios = require('axios');
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

exports.postVerifyGst = async(req, res) => {
	try {
		const payload = JSON.stringify({
			gstNo: req.body.gstNo,
			key_secret: 'YVlQAB0t6FcuUI0QAz16bk2BtDj1'
		});
		const data = await axios.post('https://appyflow.in/api/verifyGST', payload, {headers: {'Content-Type': 'application/json'}});
		res.json(data.data);
	} catch (err) {
		res.status(500)
			.json(err);
	}
};
