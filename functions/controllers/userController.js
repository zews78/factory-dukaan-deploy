const firebase = require('../firebase');
const axios = require('axios');
const config = require('../../config');
const {user} = require('firebase-functions/lib/providers/auth');

// const validator = require('validator');

exports.getUserProfile = async(req, res) => {
	const userId = req.params.userId || req.uid;
	const userSnapshot = await firebase.firestore()
		.collection('users')
		.doc(userId)
		.get();
	if (!userSnapshot.exists) {
		throw new Error('user not found');
	}

	const productsSnapshot = await firebase.firestore()
		.collection('products')
		.where('uid', '==', userId)
		.get();
	let products = [];
	if (!productsSnapshot.empty) {
		products = productsSnapshot.forEach(product => product.data());
	}

	res.render('user/profile.ejs', {
		pageTitle: 'Profile',
		auth: true,
		authorized: userId === req.uid,
		user: {
			...userSnapshot.data(),
			id: userId
		},
		products
	});
};

exports.getUserPayment = (req, res) => {
	res.render('../views/user/payment.ejs', {
		pageTitle: 'Payment',
		auth: true
	});
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
			key_secret: config.key_secret
		});
		const data = await axios.post(
			'https://appyflow.in/api/verifyGST',
			payload,
			{headers: {'Content-Type': 'application/json'}}
		);
		if (data.data.error) {
			res.json({status: 'Invalid gst number'});
		} else {
			if (req.body.panNo === data.data.taxpayerInfo.panNo.substr(data.data.taxpayerInfo.panNo.length - 4)) {

				await firebase.firestore()
					.collection('users')
					.doc(req.uid)
					.update({gstNo: req.body.gstNo});
				res.json({status: 'verified'});
			} else {
				res.json({status: 'Invalid GST Number or PAN number'});
			}
		}
	} catch (err) {
		console.log(err);
		res.status(500)
			.json(err);
	}
};
