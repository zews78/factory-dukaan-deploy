const firebase = require('../firebase');
const axios = require('axios');
const config = require('../../config');
const razorpay = require('razorpay');
const isAuth = require('../utils/isAuth');
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

exports.getUserPayment = async(req, res) => {
	const auth = (await isAuth(req))[0];
	const instance = new razorpay({
		key_id: config.razorpay.key_id,
		key_secret: config.razorpay.key_secret
	});
	let amount = {};

	if(req.query.package === 'silver') {
		amount = {amount: config.razorpay.silverPackage};
	}
	if(req.query.package === 'gold') {
		amount = {amount: config.razorpay.goldPackage};
	}
	if(req.query.package === 'platinum') {
		amount = {amount: config.razorpay.platinumPackage};
	}
	instance.orders.create(amount)
		.then((data)=>{
			res.render('user/checkout.ejs', {
				orderData: data,
				auth,
				amount: amount,
				key_id: config.razorpay.key_id,
				packageName: req.query.package.charAt(0)
					.toUpperCase() + req.query.package.slice(1)
			});

		})
		.catch((error)=>{
			res.json({error});
		});


};

exports.paymentVerification = async(req, res)=>{
	const body = req.body.response.razorpay_order_id + '|' + req.body.response.razorpay_payment_id;
	const crypto = require('crypto');
	var expectedSignature = crypto.createHmac('sha256', config.razorpay.key_secret)
		.update(body.toString())
		.digest('hex');
	let package = null;

	if(req.body.amount === config.razorpay.silverPackage) {
		package = 'Silver';
	}
	if(req.body.amount === config.razorpay.goldPackage) {
		package = 'Gold';
	}
	if(req.body.amount === config.razorpay.platinumPackage) {
		package = 'Platinum';
	}
	const expiresOn = new Date();
	if(expectedSignature === req.body.response.razorpay_signature) {
		expiresOn.setDate(new Date()
			.getDate() + 30);
		try{ await firebase
			.firestore()
			.collection('users')
			.doc(req.uid)
			.update({
				packPurchased: package,
				expiresOn: expiresOn
			});
		}catch(error) {
			console.log(error);
		}
		res.json({status: 'success'});
	}else{
		res.json({status: 'failure'});
	}

};

exports.getSuccessfulPayment = async(req, res)=>{
	const auth = (await isAuth(req))[0];
	res.render('user/paymentSuccess.ejs', {auth});
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
