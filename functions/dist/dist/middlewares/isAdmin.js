const isAuth = require('../utils/isAuth');
module.exports = async (req, res, next) => {
  const [auth, decodedToken] = await isAuth(req);
  if (auth) {
    if (decodedToken.admin) {
      next();
    } else {
      res.redirect('/');
    }
  } else {
    res.redirect('/login');
  }
};