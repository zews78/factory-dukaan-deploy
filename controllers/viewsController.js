exports.getLogin = async(req, res) => {
	res.render('../views/login.hbs');
};

exports.getSignUp = (req, res) => {
	res.render('../views/signup.hbs');
};
exports.goHome = (req, res) =>{
	res.render('../views/home.hbs');
};
