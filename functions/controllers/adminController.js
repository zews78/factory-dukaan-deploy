const firebase = require('../firebase');
const keywordGenerator = require('../utils/keywordGenerator');

exports.getDashboard = async(req, res) => {
	res.redirect('/admin/products');
	// res.render('../views/admin/dashboard.hbs');
};

exports.getProducts = async(req, res) => {
	try {
		const limit = +req.query.limit || 10;

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
		}
		if (req.query.sortBy !== 'createdOn') {
			productsRef = productsRef.orderBy('createdOn', 'desc');
		}

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

		// Pagination buttons after/before links
		let last = productsSnapshot.docs[productsSnapshot.docs.length - 1];
		let first = productsSnapshot.docs[0];

		const prevSnapshot = await firebase
			.firestore()
			.collection('products')
			.orderBy('price', 'desc')
			.endBefore(first)
			.limitToLast(1)
			.get();
		if (prevSnapshot.docs.length > 0) {
			first = '?before=' + first.id;
		} else {
			first = false;
		}

		const nextSnapshot = await firebase
			.firestore()
			.collection('products')
			.orderBy('price', 'desc')
			.startAfter(last)
			.limit(1)
			.get();
		if (nextSnapshot.docs.length > 0) {
			last = '?after=' + last.id;
		} else {
			last = false;
		}

		res.render('../views/admin/products.hbs', {
			products,
			links: {
				prev: first,
				next: last
			}
		});
	} catch (err) {
		console.log(err);
	}
};
