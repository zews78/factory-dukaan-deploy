const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

// Setting public path
app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());
// parse cookies
app.use(cookieParser());

// setting views folder as the default view folder
app.set('views', path.join(__dirname, 'views'));

// importing all necessary routes
const authRoutes = require('./routes/auth');

// using all necessary routes
app.use(authRoutes);

const PORT = 3000;
app.listen(PORT, () =>
	console.log(`Server started @${PORT}`)
);
