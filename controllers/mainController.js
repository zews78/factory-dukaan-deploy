const firebase = require('../firebase');

exports.getHome = (req, res) => {
	res.render('../views/main/home.hbs');
};

exports.getProducts = (req, res) => {
	res.render('../views/main/products.hbs');
};

exports.postCreateProduct = async(req, res) => {
	try {
		await firebase.firestore()
			.collection('products')
			.add(req.body);
		res.redirect('/user/products');
	} catch (err) {
		console.log(err);
	}
};
