const firebase = require('../firebase');

const isAuth = require('../utils/isAuth');

exports.getHome = async(req, res) => {
	const auth = (await isAuth(req))[0];
	res.render('../views/main/home.hbs', {auth});
};

exports.getProducts = async(req, res) => {
	const auth = (await isAuth(req))[0];
	res.render('../views/main/products.hbs', {auth});
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
