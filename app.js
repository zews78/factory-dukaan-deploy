const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public'));
// to recognise incoming request object as array/string
app.use(express.urlencoded({extended: false}));
app.set('views', path.join(__dirname, 'views'));

const authRoutes = require('./routes/auth');

app.use(authRoutes);

const PORT = 3001;
app.listen(PORT, () =>
	console.log(`Server started @${PORT}`)
);
