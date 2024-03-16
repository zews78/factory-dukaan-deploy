const firebase = require('../firebase');
const isAuth = require('./isAuth');
module.exports = async req => {
  try {
    const [auth, decodedToken] = await isAuth(req);
    if (auth) {
      const user = await firebase.firestore().collection('users').doc(decodedToken.uid).get();
      if (user.data()) {
        if (user.data().name && user.data().email && user.data().company.name && user.data().company.address) {
          return 3;
        } else {
          return 2;
        }
      } else {
        return 2;
      }
    } else {
      return 1;
    }
  } catch (err) {
    console.log(err);
    return 1;
  }
};