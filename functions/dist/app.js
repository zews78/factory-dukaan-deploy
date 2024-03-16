const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

// Setting public path
app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));
// parse application/json
app.use(bodyParser.json());
// parse cookies
app.use(cookieParser());

// Setting ejs as view engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// importing all necessary routes

const mainRouter = require('./routes/mainRouter');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const adminRouter = require('./routes/adminRouter');
const redirectTo = require('./middlewares/redirectTo');
const isAuth = require('./middlewares/isAuth');
const isAdmin = require('./middlewares/isAdmin');

// using all necessary routes
// app.use(viewRouter); // Comment me during backend development
app.use(mainRouter);
app.use(authRouter);
app.use('/user', redirectTo, isAuth, userRouter);
app.use('/admin', isAdmin, adminRouter);
module.exports = app;