const firebase = require('../firebase');
const axios = require('axios');
const config = require('../.config');
// const x = require('../')D:\personal_projects\factory-dukaan\functions\.config
const razorpay = require('razorpay');
const keywordGenerator = require('../utils/keywordGenerator');
const isAuth = require('../utils/isAuth');

// const validator = require('validator');

exports.getUserProfile = async (req, res) => {
  const userId = req.params.userId || req.uid;
  const userSnapshot = await firebase.firestore().collection('users').doc(userId).get();
  if (!userSnapshot.data().name) {
    res.redirect('/login');
  } else {
    if (!userSnapshot.exists) {
      throw new Error('user not found');
    }
    const reqSnapshot = await firebase.firestore().collection('requirements').where('uid', '==', userId).get();
    let req_prod = [];
    if (!reqSnapshot.empty) {
      reqSnapshot.forEach(product => {
        let productData = product.data();
        productData.id = product.id;
        req_prod.push(productData);
      });
    }
    // console.log(req_prod);

    const productsSnapshot = await firebase.firestore().collection('products').where('uid', '==', userId).get();
    let products = [];
    let wishlist = [];
    if (!productsSnapshot.empty) {
      productsSnapshot.forEach(product => {
        let productData = product.data();
        productData.id = product.id;
        products.push(productData);
      });
    }
    if (userSnapshot.data().wishlist.length > 0) {
      for (let i = 0; i < userSnapshot.data().wishlist.length > 0; i++) {
        let item = await firebase.firestore().collection('products').doc(userSnapshot.data().wishlist[i]).get();
        if (item.data()) {
          let itemSnapshot;
          itemSnapshot = item.data();
          itemSnapshot.productId = item.id;
          wishlist.push(itemSnapshot);
        }
      }
    }
    res.render('user/profile.ejs', {
      pageTitle: 'Profile',
      auth: true,
      wishlist,
      authorized: userId === req.uid,
      user: {
        ...userSnapshot.data(),
        id: userId
      },
      products,
      req_prod
    });
  }
};
exports.postUpdateProfilePic = async (req, res) => {
  try {
    const userRef = firebase.firestore().collection('users').doc(req.uid);
    await userRef.update({
      profile_pic: req.body.profile_pic
    });
    // console.log(req.body);
    res.json({
      message: 'success'
    });
  } catch (err) {
    res.status(500).json({
      message: 'failed'
    });
  }
};
exports.postUpdateUser = async (req, res) => {
  function randomString(chars) {
    var result = '';
    for (var i = 8; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  }
  const user = await firebase.firestore().collection('users').doc(req.uid);
  const userSnapshot = await user.get();
  if (!userSnapshot.data().name || !userSnapshot.data().address || !userSnapshot.data().company.name || !userSnapshot.data().company.address) {
    let referredBy;
    if (req.body.referralCode) {
      referredBy = await firebase.firestore().collection('users').where('referralCode', '==', req.body.referralCode).get();
    }
    if (referredBy) {
      if (referredBy.empty) {
        res.json({
          status: 'invalid referral code'
        });
      } else {
        referredBy.forEach(async doc => {
          const referredByUser = await firebase.firestore().collection('users').doc(doc.id);
          const referredByUserSnapshot = await referredByUser.get();
          await referredByUser.update({
            referredTo: referredByUserSnapshot.data().referredTo + 1
          });
        });
        try {
          delete req.body.referralCode;
          req.body.referralCode = randomString('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
          req.body.referredTo = 0;
          req.body.createdOn = new Date();
          req.body.wishlist = [];
          await user.update(req.body);
          res.redirect('/user/profile');
        } catch (err) {
          console.log(err);
        }
      }
    } else {
      try {
        delete req.body.referralCode;
        req.body.referralCode = randomString('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        req.body.referredTo = 0;
        req.body.createdOn = new Date();
        req.body.wishlist = [];
        await user.update(req.body);
        res.redirect('/user/profile');
      } catch (err) {
        console.log(err);
      }
    }
  } else {
    res.json({
      status: 'Failed',
      message: 'You cannot use this route to update an set user . Please Go to profile and then edit account detials section'
    });
  }
};
exports.getSellerProfile = async (req, res) => {
  const userId = req.params.userId;
  const userSnapshot = await firebase.firestore().collection('users').doc(userId).get();
  if (!userSnapshot.exists) {
    throw new Error('seller not found');
  }
  res.render('user/seller-profile.ejs', {
    pageTitle: 'Seller-profile',
    auth: true,
    authorized: userId === req.uid,
    user: {
      ...userSnapshot.data(),
      id: userId
    }
  });
};
exports.getUserPayment = async (req, res) => {
  const auth = (await isAuth(req))[0];
  const user = await firebase.firestore().collection('users').doc(req.uid).get();
  if (user.data().packPurchased && user.data().expiresOn._seconds * 1000 > Date.now()) {
    console.log('already active');
    res.render('user/checkout.ejs', {
      alreadyActivePlan: true,
      auth,
      pageTitle: 'User Plan',
      user: user.data()
    });
  } else {
    const instance = new razorpay({
      key_id: config.razorpay.key_id,
      key_secret: config.razorpay.key_secret
    });
    let amount = {};
    let sellingLimit;
    let duration;
    if (req.query.packageName === 'silver') {
      if (req.query.duration === 'half') {
        amount = {
          amount: config.razorpay.silverPackage.half
        };
        duration = 6;
      }
      if (req.query.duration === 'full') {
        amount = {
          amount: config.razorpay.silverPackage.full
        };
        duration = 12;
      }
      sellingLimit = 30;
    }
    if (req.query.packageName === 'gold') {
      if (req.query.duration === 'half') {
        amount = {
          amount: config.razorpay.goldPackage.half
        };
        duration = 6;
      }
      if (req.query.duration === 'full') {
        amount = {
          amount: config.razorpay.goldPackage.full
        };
        duration = 12;
      }
      sellingLimit = 50;
    }
    if (req.query.packageName === 'platinum') {
      if (req.query.duration === 'half') {
        amount = {
          amount: config.razorpay.platinumPackage.half
        };
        duration = 6;
      }
      if (req.query.duration === 'full') {
        amount = {
          amount: config.razorpay.platinumPackage.full
        };
        duration = 12;
      }
      sellingLimit = 'Unlimited';
    }
    instance.orders.create(amount).then(data => {
      res.render('user/checkout.ejs', {
        orderData: data,
        alreadyActivePlan: false,
        sellingLimit,
        duration,
        pageTitle: 'User Plan',
        auth,
        amount: amount,
        key_id: config.razorpay.key_id,
        packageName: req.query.packageName.charAt(0).toUpperCase() + req.query.packageName.slice(1)
      });
    }).catch(error => {
      res.json({
        error
      });
    });
  }
};
exports.paymentVerification = async (req, res) => {
  const body = req.body.response.razorpay_order_id + '|' + req.body.response.razorpay_payment_id;
  const crypto = require('crypto');
  var expectedSignature = crypto.createHmac('sha256', config.razorpay.key_secret).update(body.toString()).digest('hex');
  let packageName = null;
  let productLimit = null;
  let duration;
  if (req.body.amount === config.razorpay.silverPackage.half || req.body.amount === config.razorpay.silverPackage.full) {
    if (req.body.amount === config.razorpay.packageName.half) {
      duration = 6 * 30;
    } else {
      duration = 12 * 30;
    }
    packageName = 'Silver';
    productLimit = config.razorpay.silverSellLimit;
  }
  if (req.body.amount === config.razorpay.goldPackage.half || req.body.amount === config.razorpay.goldPackage.full) {
    if (req.body.amount === config.razorpay.goldPackage.half) {
      duration = 6 * 30;
    } else {
      duration = 12 * 30;
    }
    packageName = 'Gold';
    productLimit = config.razorpay.goldSellLimit;
  }
  if (req.body.amount === config.razorpay.platinumPackage.half || req.body.amount === config.razorpay.platinumPackage.full) {
    if (req.body.amount === config.razorpay.platinumPackage.half) {
      duration = 6 * 30;
    } else {
      duration = 12 * 30;
    }
    packageName = 'Platinum';
    productLimit = config.razorpay.platinumSellLimit;
  }
  const expiresOn = new Date();
  if (expectedSignature === req.body.response.razorpay_signature) {
    const userRef = await firebase.firestore().collection('users').doc(req.uid);
    expiresOn.setDate(new Date().getDate() + duration);
    try {
      userRef.update({
        packPurchased: packageName,
        expiresOn: expiresOn,
        productLimit,
        subscriptions: firebase.firestore.FieldValue.arrayUnion({
          start: Date(Date.now()),
          end: expiresOn,
          nameOfPack: packageName
        })
      });
    } catch (error) {
      console.log(error);
    }
    res.json({
      status: 'success'
    });
  } else {
    res.json({
      status: 'failure'
    });
  }
};
exports.getSuccessfulPayment = async (req, res) => {
  const auth = (await isAuth(req))[0];
  res.render('user/paymentSuccess.ejs', {
    auth,
    pageTitle: 'User Plan'
  });
};
exports.postVerifyGst = async (req, res) => {
  try {
    const payload = JSON.stringify({
      gstNo: req.body.gstNo,
      key_secret: config.key_secret
    });
    const data = await axios.post('https://appyflow.in/api/verifyGST', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (data.data.error) {
      res.json({
        status: 'Invalid gst number'
      });
    } else {
      if (req.body.panNo === data.data.taxpayerInfo.panNo.substr(data.data.taxpayerInfo.panNo.length - 4)) {
        await firebase.firestore().collection('users').doc(req.uid).update({
          gstNo: req.body.gstNo
        });
        res.json({
          status: 'verified'
        });
      } else {
        res.json({
          status: 'Invalid GST Number or PAN number'
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};
exports.getSellingPage = async (req, res) => {
  const auth = (await isAuth(req))[0];
  const user = await firebase.firestore().collection('users').doc(req.uid).get();
  if (!user.data().packPurchased || user.data().expiresOn._seconds * 1000 < Date.now()) {
    res.redirect('/pricing');
  } else {
    const productsSnapshot = await firebase.firestore().collection('products').where('uid', '==', req.uid).get();
    let products = [];
    let productsId = [];
    productsSnapshot.forEach(doc => {
      products.push(doc.data());
    });
    // console.log(products);

    productsSnapshot.forEach(doc => {
      productsId.push(doc.id);
    });
    res.render('user/sell-page.ejs', {
      auth,
      pageTitle: 'Sell Page',
      user: user.data(),
      products,
      productsId
    });
  }
};
exports.deleteProduct = async (req, res) => {
  const productRef = await firebase.firestore().collection('products').doc(req.body.productId);
  const productSnapshot = await productRef.get();
  if (productSnapshot.data().uid === req.uid) {
    await productRef.delete();
    res.json({
      status: 'success'
    });
  } else {
    res.json({
      status: 'unauthorised'
    });
  }
};
exports.updateProduct = async (req, res) => {
  const productRef = await firebase.firestore().collection('products').doc(req.body.productId);
  const productSnapshot = await productRef.get();
  if (productSnapshot.data().uid === req.uid) {
    await productRef.update(req.body.productUpdatedInfo);
    res.json({
      status: 'success'
    });
  } else {
    res.json({
      status: 'unauthorised'
    });
  }
};
exports.sellProduct = async (req, res) => {
  req.body.createdOn = new Date();
  req.body.uid = req.uid;
  const user = await firebase.firestore().collection('users').doc(req.uid).get();
  const productsCount = await firebase.firestore().collection('products').where('uid', '==', req.uid).get();
  let count = 0;
  productsCount.forEach(() => {
    count = count + 1;
  });
  if (user.data().productLimit > count) {
    try {
      keywordGenerator(req.body.title + ' ' + req.body.desc).forEach(keyword => {
        req.body.keywords.push(keyword);
      });
      await firebase.firestore().collection('products').add(req.body);
      res.json({
        status: 'success'
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.json({
      status: 'fail'
    });
  }
};
exports.postReview = async (req, res) => {
  console.log('POST REVIEW');
  const productRef = await firebase.firestore().collection('products').doc(req.params.productId);
  let reviewed = false;
  await productRef.get().then(async doc => {
    let reviewsArray = doc.data().reviews || 0;
    for (var i = 0; i < reviewsArray.length; i++) {
      if (reviewsArray[i].userInfo._path.segments[1] === req.uid) {
        console.log('Not allowed to post another review');
        reviewed = true;
        console.log(reviewed);
        break;
      }
    }
  });
  if (!reviewed) {
    try {
      productRef.update({
        reviews: firebase.firestore.FieldValue.arrayUnion({
          rating: req.body.rating,
          review: req.body.review,
          userInfo: firebase.firestore().doc(`/users/${req.uid}`),
          postedOn: new Date()
        })
      });
      res.json({
        status: 'success'
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.json({
      status: 'Alreayd Reviewed Please delete that review to create a new review'
    });
  }
};
exports.getPlanValidities = async (req, res) => {
  const auth = (await isAuth(req))[0];
  let plan = req.query.packageName;
  let prices;
  if (plan === 'silver') {
    prices = config.razorpay.silverPackage;
  }
  if (plan === 'gold') {
    prices = config.razorpay.goldPackage;
  }
  if (plan === 'platinum') {
    prices = config.razorpay.platinumPackage;
  }
  res.render('main/validitySelection.ejs', {
    auth,
    prices,
    plan,
    pageTitle: 'Select Plan Duration'
  });
};