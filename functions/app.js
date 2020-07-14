const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');

const app = express();

// Setting public path
app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());
// parse cookies
app.use(cookieParser());

// Define paths for express config
const viewsDirectory = path.join(__dirname, '/templates/views');
const partialsDirectory = path.join(__dirname, '/templates/partials');

// Setting hbs as view engine
app.set('view engine', 'hbs');
app.set('views', viewsDirectory);
hbs.registerPartials(partialsDirectory);

// importing all necessary routes
const viewRouter = require('./routes/viewRouter');
const mainRouter = require('./routes/mainRouter');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const adminRouter = require('./routes/adminRouter');

const isAuth = require('./middlewares/isAuth');
const isAdmin = require('./middlewares/isAdmin');

// using all necessary routes
app.use(viewRouter); // Comment me during backend development
app.use(mainRouter);
app.use(authRouter);
app.use('/user', isAuth, userRouter);
app.use('/admin', isAdmin, adminRouter);

module.exports = app;
