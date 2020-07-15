const firebase = require('../firebase');

exports.getDashboard = async(req, res) => {
	res.redirect('/admin/products');
	// res.render('../views/admin/dashboard.hbs');
};

exports.getProducts = async(req, res) => {
	try {

		// Creating a reference to products
		let productsRef = firebase.firestore()
			.collection('products')
			.orderBy('createdOn', 'desc');

		// If there is a query param after/before
		if (req.query.after) {
			let lastSnapshot = await firebase.firestore()
				.collection('products')
				.doc(req.query.after)
				.get();
			productsRef = productsRef.startAfter(lastSnapshot);
		} else if (req.query.before) {
			let firstSnapshot = await firebase.firestore()
				.collection('products')
				.doc(req.query.before)
				.get();
			productsRef = productsRef.endBefore(firstSnapshot);
		}

		// Settings limit
		productsRef = productsRef.limit(15);

		// Fetching the productsSnapshot
		const productsSnapshot = await productsRef.get();

		// Making products ready for passing to templating engine for rendering
		const products = [];
		productsSnapshot.forEach(product => {
			products.push({
				id: product.id,
				...product.data(),
				createdOn: product.data().createdOn.toDate()
					.toLocaleString()
			});
		});

		// Pagination buttons after/before links
		const after = productsSnapshot.docs[productsSnapshot.docs.length - 1].id;
		const before = productsSnapshot.docs[0].id;

		res.render('../views/admin/products.hbs', {
			products,
			links: {
				previous: `?before=${before}`,
				next: `?after=${after}`
			}
		});
	} catch(err) {
		console.log(err);
	}
};