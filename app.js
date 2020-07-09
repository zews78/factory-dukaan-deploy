const express = require('express');
const path = require('path');
const app = express();

// Setting public path
app.use(express.static('public'));

// to recognise incoming request object as array/string
app.use(express.urlencoded({extended: false}));

// setting views folder as the default view folder
app.set('views', path.join(__dirname, 'views'));

// importing all necessary routes
const authRoutes = require('./routes/auth');

// using all necessary routes
app.use(authRoutes);

const PORT = 3001;
app.listen(PORT, () =>
	console.log(`Server started @${PORT}`)
);
