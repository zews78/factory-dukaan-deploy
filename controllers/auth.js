exports.getLogin = (req, res) => {
	res.render('auth/login.ejs');
};
exports.signUp =(req, res) => {
	res.render('auth/signup.ejs');
}