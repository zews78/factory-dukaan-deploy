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
		productsSnapshot.forEach((product) => {
			products.push({
				id: product.id,
				...product.data(),
				createdOn: product.data().createdOn.toDate()
					.toLocaleString()
			});
		});

		if (products.length === 0) {
			res.render('/products', {
				pageTitle: 'Products',
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

		const [auth] = await isAuth(req);
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

exports.getOneProduct = async(req, res)=>{
	const auth = (await isAuth(req))[0];
	const product = await firebase.firestore()
		.collection('products')
		.doc(req.params.productId)
		.get();
	const user = await firebase.firestore()
		.collection('users')
		.doc(req.uid)
		.get();

	if(user.data().expiresOn._seconds * 1000 < Date.now()) {
		console.log('PLEASE PURCHASE A PLAN');
	}
	res.render('main/productDetails.ejs', {
		pageTitle: 'Product Details',
		auth,
		productData: product.data()
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

exports.getContacts = async(req, res) => {
	try{
		const FAQRef = firebase.firestore()
			.collection('config')
			.doc('FAQ');
		const doc = await FAQRef.get();
		const FAQ = doc.data();
		console.log(FAQ);
		const auth = (await isAuth(req))[0];
		res.render('main/contact.ejs', {
			pageTitle: 'Contacts',
			FAQ,
			auth
		});
	} catch(err) {
		console.log(err);
	}
};

exports.getPlanDetails = async(req, res)=>{
	const auth = (await isAuth(req))[0];
	res.render('main/plan-details.ejs', {
		pageTitle: 'Factory-Dukaan | Plans',
		auth
	});
};
