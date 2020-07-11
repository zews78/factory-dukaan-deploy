const firebase = require("../firebase");

exports.postLogin = async (req, res) => {
  console.log(req.body);
  if (req.body.additionalUserInfo.isNewUser) {
    // Create a new user
    const userData = {};
    const uid = req.body.user.uid;
    userData.mobile = req.body.user.phoneNumber;
    firebase.firestore().collection("users").doc(uid).set(userData);
  } else {
    // Login
    console.log("for login");
  }
  res.cookie(
    "firebase-jwt-token",
    "Bearer " + req.body.user.stsTokenManager.accessToken,
    { httpOnly: true }
  );
  // res.redirect("/login");
  res.render("../views/home.hbs");
};
