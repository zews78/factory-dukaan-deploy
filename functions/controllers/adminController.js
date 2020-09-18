const firebase = require('../firebase');
const keywordGenerator = require('../utils/keywordGenerator');


exports.getDashboard = async(req, res) => {
	res.redirect('/admin/products');
	// res.render('admin/dashboard', {pageTitle: 'Dashboard - Admin'});
};

exports.getProducts = async(req, res) => {
	try {
		const limit = +req.query.limit || 15;

		// Creating a reference to products
		let productsRef = firebase.firestore()
			.collection('products');

		// Filtering
		if (req.query.search) {
			productsRef = productsRef.where('keywords', 'array-contains-any', keywordGenerator(req.query.search));
		}

		// Sorting
		if (req.query.sortBy) {
			productsRef = productsRef.orderBy(req.query.sortBy, req.query.order || 'asc');
		} else {
			productsRef = productsRef.orderBy('createdOn', 'desc');
		}

		const paginationValidationRef = productsRef;

		// If there is a query param after/before
		if (req.query.after) {
			let lastSnapshot = await firebase.firestore()
				.collection('products')
				.doc(req.query.after)
				.get();
			productsRef = productsRef.startAfter(lastSnapshot)
				.limit(limit);
		} else if (req.query.before) {
			let firstSnapshot = await firebase.firestore()
				.collection('products')
				.doc(req.query.before)
				.get();
			productsRef = productsRef.endBefore(firstSnapshot)
				.limitToLast(limit);
		} else {
			productsRef = productsRef.limit(limit);
		}

		// Fetching the productsSnapshot
		const productsSnapshot = await productsRef.get();


		// Making products ready for passing to templating engine for rendering
		const products = [];
		productsSnapshot.forEach((product) => {
			products.push({
				id: product.id,
				...product.data(),
				createdOn: product.data().createdOn.toDate()
					.toLocaleString()
			});
		});

		if (products.length === 0) {
			res.render('admin/products', {
				pageTitle: 'Products - Admin',
				products: [],
				queryParams: req.query
			});
			return;
		}

		// Pagination buttons after/before links
		let last = productsSnapshot.docs[productsSnapshot.docs.length - 1];
		let first = productsSnapshot.docs[0];

		const queryParams = {...req.query};

		// Checking that there is a prev page available
		const prevSnapshot = await paginationValidationRef.endBefore(first)
			.limitToLast(1)
			.get();
		if (prevSnapshot.docs.length === 0) {
			first = false;
		} else {
			first = first.id;
		}

		// Checking that there is a next page available
		const nextSnapshot = await paginationValidationRef.startAfter(last)
			.limit(1)
			.get();
		if (nextSnapshot.docs.length === 0) {
			last = false;
		} else {
			last = last.id;
		}

		// Generating query string
		let queryString = '?';
		for (let query in queryParams) {
			if (!(query === 'before' || query === 'after')) {
				queryString += query + '=' + queryParams[query] + '&';
			}
		}

		res.render('admin/products', {
			pageTitle: 'Products - Admin',
			products,
			links: {
				prev: first,
				next: last
			},
			queryParams: req.query,
			queryString
		});
	} catch (err) {
		console.log(err);
	}
};

exports.getUsers = async(req, res) => {
	try {
		const limit = +req.query.limit || 15;

		// Creating a reference to users
		let usersRef = firebase.firestore()
			.collection('users');

		// Filtering
		if (req.query.search) {
			usersRef = usersRef.where('name', '>=', req.query.search)
				.where('name', '<=', req.query.search + '\uf8ff')
				.orderBy('name', 'asc');
		}

		// Sorting
		if (req.query.sortBy) {
			usersRef = usersRef.orderBy(req.query.sortBy, req.query.order || 'asc');
		} else {
			usersRef = usersRef.orderBy('createdOn', 'desc');
		}

		const paginationValidationRef = usersRef;

		// If there is a query param after/before
		if (req.query.after) {
			let lastSnapshot = await firebase.firestore()
				.collection('users')
				.doc(req.query.after)
				.get();
			usersRef = usersRef.startAfter(lastSnapshot)
				.limit(limit);
		} else if (req.query.before) {
			let firstSnapshot = await firebase.firestore()
				.collection('users')
				.doc(req.query.before)
				.get();
			usersRef = usersRef.endBefore(firstSnapshot)
				.limitToLast(limit);
		} else {
			usersRef = usersRef.limit(limit);
		}

		// Fetching the usersSnapshot
		const usersSnapshot = await usersRef.get();

		// Making users ready for passing to templating engine for rendering
		const users = [];
		usersSnapshot.forEach((user) => {
			users.push({
				id: user.id,
				...user.data(),
				createdOn: user.data().createdOn.toDate()
					.toLocaleString()
			});
		});

		if (users.length === 0) {
			res.render('admin/users', {
				pageTitle: 'Users - Admin',
				users: [],
				queryParams: req.query
			});
			return;
		}

		// Pagination buttons after/before links
		let last = usersSnapshot.docs[usersSnapshot.docs.length - 1];
		let first = usersSnapshot.docs[0];

		const queryParams = {...req.query};

		// Checking that there is a prev page available
		const prevSnapshot = await paginationValidationRef.endBefore(first)
			.limitToLast(1)
			.get();
		if (prevSnapshot.docs.length === 0) {
			first = false;
		} else {
			first = first.id;
		}

		// Checking that there is a next page available
		const nextSnapshot = await paginationValidationRef.startAfter(last)
			.limit(1)
			.get();
		if (nextSnapshot.docs.length === 0) {
			last = false;
		} else {
			last = last.id;
		}

		// Generating query string
		let queryString = '?';
		for (let query in queryParams) {
			if (!(query === 'before' || query === 'after')) {
				queryString += query + '=' + queryParams[query] + '&';
			}
		}

		res.render('admin/users', {
			pageTitle: 'Users - Admin',
			users,
			links: {
				prev: first,
				next: last
			},
			queryParams: req.query,
			queryString
		});
	} catch (err) {
		console.log(err);
	}
};



exports.getUserDetails = async(req, res)=>{
	res.render('admin/user-details.ejs', {pageTitle: 'User Details - Admin'});
};

exports.getPendingGstVerifications = async(req, res) => {
	const requestsSnapshot = await firebase.firestore()
		.collection('pending-gst-verifications')
		.get();
	const requests = requestsSnapshot.docs.map(request => ({
		...request.data(),
		id: request.id,
		createdOn: request.data().createdOn.toDate()
			.toLocaleString()
	}));

	res.render('admin/pending-gst-verifications', {
		pageTitle: 'GST Verification - Admin',
		requests
	});
};

exports.getPendingGstVerification = async(req, res) => {
	const requestId = req.params.requestId;

	const requestSnapshot = await firebase.firestore()
		.collection('pending-gst-verifications')
		.doc(requestId)
		.get();

	const userSnapshot = await firebase.firestore()
		.collection('users')
		.doc(requestSnapshot.data().user.uid)
		.get();

	res.render('admin/pending-gst-verification', {
		pageTitle: 'GST Verification - Admin',
		user: userSnapshot.data(),
		request: {
			...requestSnapshot.data(),
			id: requestSnapshot.id
		}
	});
};

exports.postVerifyPendingGstVerification = (req, res) => {
	// const verified = req.body.verified;
	// verify login goes here
	res.redirect('/admin/pending-gst-verifications');
};

exports.postUpdateSubscription = async(req, res) => {
	try {
		const userRef = firebase.firestore()
			.collection('users')
			.doc(req.body.uid);
		if (req.body.subscription) {
			await userRef
				.update({
					subscriptions: firebase.firestore.FieldValue.arrayUnion({
						start: firebase.firestore.Timestamp.now(),
						end: firebase.firestore.Timestamp.fromMillis(firebase.firestore.Timestamp.now()
							.toMillis() + +req.body.subscriptionValidity * 24 * 60 * 60 * 1000)
					})
				});
		} else {
			const userSnapshot = await userRef.get();
			const subscriptions = userSnapshot.data().subscriptions;
			subscriptions[subscriptions.length - 1].end = firebase.firestore.Timestamp.now();
			await userRef.update({subscriptions});
		}
		res.json({message: 'success'});
	} catch(err) {
		res.status(500)
			.json({message: 'failed'});
	}
};

exports.deleteUser = async(req, res) => {
	try {
		const userRef = firebase.firestore()
			.collection('users')
			.doc(req.body.uid);
		await userRef.delete();
		res.json({message: 'success'});
	} catch(err) {
		res.status(500)
			.json({message: 'failed'});
	}
};

exports.postBlockUser = async(req, res) => {
	try {
		const userRef = firebase.firestore()
			.collection('users')
			.doc(req.body.uid);
		await userRef.update({blocked: req.body.block});
		res.json({message: 'success'});
	} catch(err) {
		res.status(500)
			.json({message: 'failed'});
	}
};

exports.getPrdouctDetails = async(req, res)=>{

	const prodDetails = await firebase.firestore()
		.collection('products')
		.doc(req.params.productId)
		.get();
	// console.log(prodDetails.data());

	res.render('admin/product-details.ejs', {
		pageTitle: 'Product Details - Admin',
		prodDetails: prodDetails.data(),
		productId: req.params.productId
	});
};

exports.editProductDetails = async(req, res) => {
	try {
		const userRef = firebase.firestore()
			.collection('products')
			.doc(req.body.uid);
		await userRef.update({
			title: req.body.title,
			desc: req.body.desc,
			keywords: req.body.keywords,
			specs: JSON.parse(req.body.specs),
			images: req.body.img_url
		});
		// res.redirect('back');
		// console.log();
		res.json({message: 'success'});
	} catch(err) {
		res.status(500)
			.json({message: 'failed'});
	}
};

exports.getFaq = async(req, res) => {
	try{
		var FAQr = [];
		const FAQRef = firebase.firestore()
			.collection('config')
			.doc('FAQ')
			.collection('q-a');
		const snapshot = await FAQRef.get();
		snapshot.forEach(doc => {
			// console.log(doc.id, '=>', doc.data());
			// const FAQ = doc.data();
			FAQr.push({
				id: doc.id,
				...doc.data()
			});
		});

		// console.log(doc.docs);
		// console.log(FAQr);
		// const auth = (await isAuth(req))[0];
		res.render('admin/faq.ejs', {
			pageTitle: 'faq - Admin',
			FAQr
		});
	} catch(err) {
		console.log(err);
	}
};
exports.createFaq = async(req, res) => {
	try {
		// var type = req.body.Type;
		// var ques = "checking it";
		// var ans = "worked";
		var ques = req.body.ques;
		var ans = req.body.ans;


		await firebase.firestore()
			.collection('config')
			.doc('FAQ')
			.collection('q-a')
			// .doc(doc.id)
			.add({
				ques: ques,
				ans: ans
			});
		// console.log(submitValue);
		console.log('Succesfully Submitted your Query/Complaint');
		res.redirect('/admin/faq');
	} catch (err) {
		console.log(err);
	}
};
exports.deleteFaq = async(req, res) => {
	try {
		const userRef = firebase.firestore()
			.collection('config')
			.doc('FAQ')
			.collection('q-a')
			.doc(req.body.uid);
		await userRef.delete();
		res.json({message: 'success'});
	} catch(err) {
		res.status(500)
			.json({message: 'failed'});
	}
};
exports.editFaq = async(req, res) => {
	try {
		var ques = req.body.ques;
		var ans = req.body.ans;
		var uid = req.body.uid;
		const FAQref = await firebase.firestore()
			.collection('config')
			.doc('FAQ')
			.collection('q-a')
			.doc(uid);
		FAQref.update({
			ques: ques,
			ans: ans
		});
		// res.json({message: 'success'});
		// console.log(uid, ques, ans);
		res.redirect('/admin/faq');
	} catch(err) {
		console.log(err);
		// res.status(500)
		// 	.json({message: 'failed'});
	}
	// console.log('succesfully working');
};



exports.getQuery = async(req, res) => {
	try{
		var queryR = [];
		const QueryRef = firebase.firestore()
			.collection('query');
		// const doc = await QueryRef.get();
		// const Query = doc.data();

		const snapshot = await QueryRef
			.orderBy('postedOn', 'desc')
			.get();
		snapshot.forEach(doc => {
			// console.log(doc.id, '=>', doc.data());
			// const FAQ = doc.data();
			queryR.push({
				id: doc.id,
				...doc.data(),
				postedOn: doc.data().postedOn.toDate()
					.toLocaleString()
			});
		});
		console.log(queryR);
		res.render('admin/query.ejs', {
			pageTitle: 'query - Admin',
			queryR
		});
	} catch(err) {
		console.log(err);
	}
};
exports.deleteQuery = async(req, res) => {
	try {
		const queryRef = firebase.firestore()
			.collection('query')
			.doc(req.body.uid);
		await queryRef.delete();
		res.json({message: 'success'});
	} catch(err) {
		res.status(500)
			.json({message: 'failed'});
	}
};

exports.postUpdateStatus = async(req, res) => {
	try {
		var status = req.body.status;
		const queryRef = firebase.firestore()
			.collection('query')
			.doc(req.body.uid);
		await queryRef.update({status});
		res.json({message: 'success'});
	} catch(err) {
		res.status(500);
		res.json({message: 'failed'});
	}
	// console.log(req.body.status);
};