const firebase = require('../firebase');

const isAuth = require('../utils/isAuth');

exports.getHome = async(req, res) => {
	const auth = (await isAuth(req))[0];
	res.render('main/home', {auth});
};

exports.getProducts = async(req, res) => {
	// Search - search in keywords
	// Filter - Price(asc, desc), new
	const auth = (await isAuth(req))[0];
	const products = await firebase.firestore()
		.collection('products')
		.orderBy('price');
	let queriedProduct = null;

	if (req.query['tags']) {
		queriedProduct = await products
			.where('tags', 'array-contains-any', req.query['tags'].split(' '))
			.get();
	} else {
		queriedProduct = await products.get();
	}

	res.render('main/products.ejs', {
		auth,
		products: queriedProduct
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
