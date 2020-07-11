const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const hbs = require('hbs');

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
const userRouter = require('./routes/userRouter');
const viewRouter = require('./routes/viewRouter');

// using all necessary routes
app.use('/', viewRouter);
app.use('/users', userRouter);

module.exports = app;
