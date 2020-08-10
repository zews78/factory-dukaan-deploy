const firebase = require('../firebase');
const axios = require('axios');
const config = require('../../config');
const razorpay = require('razorpay');
const isAuth = require('../utils/isAuth');


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
		productsSnapshot.forEach(product => products.push(product.data()));
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

	const user = await firebase.firestore()
		.collection('users')
		.doc(req.uid)
		.get();

	if(user.data().packPurchased && user.data().expiresOn._seconds * 1000 > Date.now()) {
		console.log('already active');
		res.render('user/checkout.ejs', {
			alreadyActivePlan: true,
			auth,
			user: user.data()
		});
	}else{
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
					alreadyActivePlan: false,
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
	}


};

exports.paymentVerification = async(req, res)=>{
	const body = req.body.response.razorpay_order_id + '|' + req.body.response.razorpay_payment_id;
	const crypto = require('crypto');
	var expectedSignature = crypto.createHmac('sha256', config.razorpay.key_secret)
		.update(body.toString())
		.digest('hex');
	let package = null;
	let productLimit = null;
	if(req.body.amount === config.razorpay.silverPackage) {
		package = 'Silver';
		productLimit = config.razorpay.silverSellLimit;
	}
	if(req.body.amount === config.razorpay.goldPackage) {
		package = 'Gold';
		productLimit = config.razorpay.goldSellLimit;
	}
	if(req.body.amount === config.razorpay.platinumPackage) {
		package = 'Platinum';
		productLimit = config.razorpay.platinumSellLimit;
	}
	const expiresOn = new Date();
	if(expectedSignature === req.body.response.razorpay_signature) {
		const userRef = await firebase
			.firestore()
			.collection('users')
			.doc(req.uid);
		expiresOn.setDate(new Date()
			.getDate() + 30);
		try{ userRef
			.update({
				packPurchased: package,
				expiresOn: expiresOn,
				productLimit,
				subscriptions: firebase.firestore.FieldValue.arrayUnion({
					start: Date(Date.now()),
					end: expiresOn,
					nameOfPack: package
				})
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
		res.json({status: 'updated'});
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

exports.getSellingPage = async(req, res)=>{
	const auth = (await isAuth(req))[0];

	const user =	await firebase.firestore()
		.collection('users')
		.doc(req.uid)
		.get();
	const productsSnapshot = await firebase.firestore()
		.collection('products')
		.where('uid', '==', req.uid)
		.get();
	let products = [];
	let productsId = [];
	productsSnapshot.forEach(doc=>{
		products.push(doc.data());
	});

	productsSnapshot.forEach(doc=>{
		productsId.push(doc.id);
	});

	res.render('user/sell-page.ejs', {
		auth,
		user: user.data(),
		products,
		productsId
	});
};

exports.deleteProduct = async(req, res)=>{
	const productRef = await firebase.firestore()
		.collection('products')
		.doc(req.body.productId);
	const productSnapshot = await productRef.get();
	if(productSnapshot.data().uid === req.uid) {
		await productRef.delete();

		res.json({status: 'success'});
	}else{
		res.json({status: 'unauthorised'});
	}

};

exports.updateProduct = async(req, res)=>{

	const productRef = await firebase.firestore()
		.collection('products')
		.doc(req.body.productId);
	const productSnapshot = await productRef.get();
	if(productSnapshot.data().uid === req.uid) {
		await productRef.update(req.body.productUpdatedInfo);
		res.json({status: 'success'});
	}else{
		res.json({status: 'unauthorised'});
	}
};

exports.sellProduct = async(req, res)=>{

	req.body.createdOn = new Date();
	req.body.uid = req.uid;
	const user =	await firebase.firestore()
		.collection('users')
		.doc(req.uid)
		.get();

	const productsCount = await firebase.firestore()
		.collection('products')
		.where('uid', '==', req.uid)
		.get();
	let count = 0;
	productsCount.forEach(()=>{ count = count + 1; });

	if(user.data().productLimit > count) {
		try{
			await firebase.firestore()
				.collection('products')
				.add(req.body);
			console.log('product added');
			res.json({status: 'success'});
		}catch(error) {
			console.log(error);
		}
	}else{
		res.json({status: 'fail'});
	}

};


exports.postReview = async(req, res)=>{
	const productRef = await firebase.firestore()
		.collection('products')
		.doc(req.params.productId);
	let reviewed = false;

	await productRef.get()
		.then(async doc=>{
			let reviewsArray = doc.data().reviews;
			for (var i = 0; i < reviewsArray.length; i++) {
				if(reviewsArray[i].userInfo._path.segments[1] === req.uid) {
					console.log('Not allowed to post another review');
					reviewed = true;

					console.log(reviewed);
					break;
				}
			}
		});
	if(!reviewed) {
		try{
			productRef.update({
				reviews: firebase.firestore.FieldValue.arrayUnion({
					rating: req.body.rating,
					review: req.body.review,
					userInfo: firebase.firestore()
						.doc(`/users/${req.uid}`),
					postedOn: new Date()
				})
			});
			res.json({status: 'success'});
		}catch(error) {
			console.log(error);
		}
	}else{
		res.json({status: 'Alreayd Reviewed Please delete that review to create a new review'});
	}

};
