const firebase = require('../firebase');
const isAuth = require('../utils/isAuth');
const keywordGenerator = require('../utils/keywordGenerator');


exports.getHome = async(req, res) => {
	const auth = (await isAuth(req))[0];
	res.render('main/home', {
		pageTitle: 'Home',
		auth
	});
};

exports.getProducts = async(req, res) => {
	try {
		const limit = +req.query.limit || 12;

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
		productsSnapshot.forEach(async(product) => {
			let inWishList;
			if(req.uid) {
				const user = await firebase.firestore()
					.collection('users')
					.doc(req.uid)
					.get();

				for(let i = 0; i < user.data().wishlist.length; i++) {
					if(product.id === user.data().wishlist[i]) {
						inWishList = true;
					}
				}
			}
			products.push({
				inWishList,
				id: product.id,
				...product.data(),
				createdOn: product.data().createdOn.toDate()
					.toLocaleString()
			});
		});

		const [auth] = await isAuth(req);
		if (products.length === 0) {
			res.render('main/products', {
				pageTitle: 'Products',
				auth,
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

		res.render('main/products', {
			pageTitle: 'Products',
			auth,
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

exports.getOneProduct = async(req, res) => {
	const auth = (await isAuth(req))[0];

	const product = await firebase.firestore()
		.collection('products')
		.doc(req.params.productId)
		.get();
	const user = await firebase.firestore()
		.collection('users')
		.doc(req.uid)
		.get();


	const productReviews = product.data().reviews;
	const Seller = await firebase.firestore()
		.collection('users')
		.doc(product.data().uid)
		.get();
	let reviews = [];
	let myReview;
	let reviewed;
	let inWishList;

	console.log(user.data().wishlist);
	console.log(product.id);

	if(user.data().wishlist.length > 0) {
		for(let i = 0; i < user.data().wishlist; i++) {
			if(product.id === user.data().wishlist[i]) {
				console.log('run');
				inWishList = true;
			}
		}
	}
	if (productReviews) {
		for (let i = 0; i < productReviews.length; i++) {
			const review = {};
			await productReviews[i].userInfo.get()
				.then(res => {
					review.name = res.data().name;
					if (res.data().mobile === user.data().mobile) {
						reviewed = i;
						myReview = true;
					}
				}
				);
			review.rating = productReviews[i].rating;
			review.review = productReviews[i].review;
			review.postedOn = productReviews[i].postedOn;
			reviews.push(review);
		}
	}


	if (user.data().expiresOn._seconds * 1000 < Date.now()) {
		console.log('PLEASE PURCHASE A PLAN');
	}
	console.log(inWishList);
	res.render('main/productDetails.ejs', {
		pageTitle: 'Product Details',
		auth,
		productId: req.params.productId,
		productData: product.data(),
		inWishList,
		reviews,
		reviewed,
		myReview,
		sellerDetails: Seller.data(),
		subscriber: false
	});
};

exports.postProduct = async(req, res) => {
	try {
		await firebase.firestore()
			.collection('products')
			.add(req.body);
		res.redirect('/user/products');
	} catch (err) {
		console.log(err);
	}
};

exports.postUpdateProduct = async(req, res) => {
	try {
		await firebase
			.firestore()
			.collection('products')
			.doc(req.params.productId)
			.update(req.body);
		res.redirect('/user/products');
	} catch (err) {
		console.log(err);
	}
};

exports.getHelp = async(req, res) => {
	try {
		const auth = (await isAuth(req))[0];

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
		res.render('main/help.ejs', {
			auth,
			pageTitle: 'Help',
			FAQr
		});
	} catch (err) {
		console.log(err);
	}
};
exports.postQuery = async(req, res) => {
	try {
		const user = await firebase.firestore()
			.collection('users')
			.doc(req.uid)
			.get();

		// console.log(user.name);
		var submitValue = {
			type: req.body.Type,
			title: req.body.Title,
			description: req.body.Description,
			postedOn: new Date(),
			UserName: user.data().name,
			UserEmail: user.data().email,
			status: false
		};
		await firebase.firestore()
			.collection('query')
			.add(submitValue);
		// console.log(submitValue);
		console.log('Succesfully Submitted your Query/Complaint');
		res.redirect('/help');
	} catch (err) {
		console.log(err);
	}
};
exports.getPlanDetails = async(req, res) => {
	const auth = (await isAuth(req))[0];
	res.render('main/plan-details.ejs', {
		pageTitle: 'Plans | Factory-Dukaan',
		auth
	});
};

exports.getContacts = async(req, res) => {
	const auth = (await isAuth(req))[0];
	res.render('main/contact.ejs', {
		pageTitle: 'Contact Us',
		auth
	});
};

exports.getRequirement = async(req, res) => {
	try{
		const auth = (await isAuth(req))[0];
		var Reqr = [];
		const ReqRef = firebase.firestore()
			.collection('requirements');

		const snapshot = await ReqRef.get();
		snapshot.forEach(doc => {

			Reqr.push({
				id: doc.id,
				...doc.data()
			});
		});
		res.render('main/requirement.ejs', {
			pageTitle: 'Requirements',
			auth,
			Reqr
		});
	} catch (err) {
		console.log(err);
	}
};

exports.postAddRequirement = async(req, res) => {
	try {


		var objx = new Object();
		objx[req.body.title0] = req.body.value0;

		// var ref = storage()
		// .ref();
		// var file = event.target.files[0];
		// var name = (+new Date()) + '-' + file.name;
		// var metadata = {contentType: file.type};
		// var task = ref.child(name)
		// 	.put(file, metadata);
		// task
		// 	.then(snapshot => snapshot.ref.getDownloadURL())
		// 	.then((url) => {
		// 		console.log(url);
		// 		// document.querySelector('#someImageTagID').src = url;
		// 	})
		// 	.catch(console.error);

		// console.log(ref, file, name, metadata);


		await firebase.firestore()
			.collection('requirements')
			.add({
				uid: req.uid,
				product_name: req.body.product_name,
				specifications: objx,
				category: req.body.category,
				material_used: req.body.material_used,
				price: req.body.price,
				desc: req.body.desc,
				quantity: req.body.quantity,
				createdOn: new Date(),
				audio: req.body.audio_url,
				images: req.body.img_url
			});
		// console.log(tit);
		var c = req.body.audio_url;
		console.log('Succesfully created a req');
		console.log(req.body.img_url);
		console.log(c);
		res.redirect('/requirement');
	} catch (err) {
		console.log(err);
	}
};


exports.getOneRequirement = async(req, res) => {
	const auth = (await isAuth(req))[0];

	const requirement = await firebase.firestore()
		.collection('requirements')
		.doc(req.params.reqId)
		.get();

	const reqUser = await firebase.firestore()
		.collection('users')
		.doc(requirement.data().uid)
		.get();

	const bids = await firebase.firestore()
		.collection(`requirements/${req.params.reqId}/bids`)
		.get();
	let bidsDetails = [];
	let gettingBidData;
	if(bids.docs.length > 0) {

		gettingBidData = new Promise((resolve)=>{
			bids.docs.map(async bid=>{
				let bidDetails = {};
				bidDetails.bidderId = bid.data().user._path.segments[1];
				bidDetails.amount = bid.data().bid;
				bidDetails.postedOn = bid.data().postedOn;
				let biderInfo = await bid.data().user.get();
				bidDetails.bidderInfo = biderInfo.data();
				bidsDetails.push(bidDetails);
				if(bidsDetails.length === bids.docs.length) resolve();
			});
		}
		);
	}else{
		gettingBidData = new Promise((resolve)=>{ resolve(); });
	}
	gettingBidData.then(()=>{
		res.render('main/OneRequirement.ejs', {
			pageTitle: 'Requirement Details',
			auth,
			reqId: req.params.reqId,
			reqData: requirement.data(),
			reqName: reqUser.data().name,
			bidsDetails
		});
	});
};

exports.postBid = async(req, res)=>{

	try {

		await firebase.firestore()
			.collection(`/requirements/${req.params.reqId}/bids`)
			.add({
				user: firebase.firestore()
					.doc(`/users/${req.uid}`),
				bid: req.body.bidAmount,
				postedOn: new Date()
			});

		res.json({status: 'success'});

	} catch (error) {
		console.log(error);
		res.json({status: error});
	}

};

exports.addToWishList = async(req, res)=>{
	await firebase.firestore()
		.collection('users')
		.doc(req.uid)
		.update({wishlist: firebase.firestore.FieldValue.arrayUnion(req.body.productId)});
	res.json({status: 'added'});
};

exports.removeFromWishList = async(req, res)=>{
	await firebase.firestore()
		.collection('users')
		.doc(req.uid)
		.update({wishlist: firebase.firestore.FieldValue.arrayRemove(req.body.productId)});
	res.json({status: 'removed'});
};
