exports.getHome = (req, res) =>{
	res.render('../views/main/home.hbs');
};

exports.getProducts = (req, res) =>{
	res.render('../views/main/products.hbs');
};