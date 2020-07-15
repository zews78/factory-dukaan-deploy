const firebase = require('../firebase');

exports.getDashboard = async(req, res) => {
	res.redirect('/admin/products');
	// res.render('../views/admin/dashboard.hbs');
};

exports.getProducts = async(req, res) => {
	try {
		let productsRef = firebase.firestore()
			.collection('products')
			.orderBy('createdOn', 'desc');
		if (req.query.createdAfter) {
			productsRef = productsRef.startAfter(firebase.firestore.Timestamp.fromMillis(req.query.createdAfter));
		} else if (req.query.createdBefore) {
			productsRef = productsRef.endBefore(firebase.firestore.Timestamp.fromMillis(req.query.createdBefore));
		}
		productsRef = productsRef.limit(1);
		console.log(productsRef);
		const productsSnapshot = await productsRef.get();
		const products = [];
		productsSnapshot.forEach(product => {
			products.push({
				id: product.id,
				...product.data(),
				createdOn: product.data().createdOn.toDate()
					.toLocaleString()
			});
		});

		const createdAfter = productsSnapshot.docs[productsSnapshot.docs.length - 1].data().createdOn.toMillis();
		const createdBefore = productsSnapshot.docs[0].data().createdOn.toMillis();

		res.render('../views/admin/products.hbs', {
			products,
			links: {
				previous: `?createdBefore=${createdBefore}`,
				next: `?createdAfter=${createdAfter}`
			}
		});
	} catch(err) {
		console.log(err);
	}
};