const isAuth = require('../utils/isAuth');

module.exports = async(req, res, next) => {
	const [auth, decodedToken] = await isAuth(req);
	if (auth) {
		req.uid = decodedToken.uid;
		next();
	} else {
		res.redirect('/login');
	}
};