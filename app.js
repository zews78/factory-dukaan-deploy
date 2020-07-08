const express = require('express');
const path = require('path');
const app = express();
app.use(express.static('public'));
// to recognise incoming request object as array/string
app.use(express.urlencoded({extended: false}));

app.set('views', [path.join(__dirname, 'views'),
                  path.join(__dirname, 'views/auth/')]);



app.get('/login',(req, res)=>{
    res.render('login.ejs');
})

const PORT = 3000;
app.listen(PORT, () => console.log(`Server started @${PORT}`));