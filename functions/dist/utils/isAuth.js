const firebase = require('../firebase');
module.exports = async req => {
  try {
    let sessionCookie = req.cookies['__session'];
    if (sessionCookie) {
      const decodedToken = await firebase.auth().verifySessionCookie(sessionCookie, true);
      return [true, decodedToken];
    } else {
      return [false, {}];
    }
  } catch (err) {
    return [false, {}];
  }
};