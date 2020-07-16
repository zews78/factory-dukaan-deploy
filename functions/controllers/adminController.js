const firebase = require('../firebase');
const keywordGenerator = require('../utils/keywordGenerator');

exports.getDashboard = async(req, res) => {
	res.redirect('/admin/products');
	// res.render('admin/dashboard');
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