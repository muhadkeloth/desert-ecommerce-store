const express = require('express');
const session = require('express-session');
const logger = require('morgan')
const path = require('path')
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('connected to database'))
.catch(() => console.error('connecting to database error'))

const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');

app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));


app.use(session({
    secret: 'comDOM321e345Gter',
    resave:false,
    saveUninitialized:true 
}))

app.use((req,res,next) => {
    res.header('cache-control','no-cache private,no-store,must-revalidate');
    next();
})

app.use('/',userRoute);
app.use('/admin',adminRoute);

app.get('*',(req,res) => {
    const userId = req.session?.user;
    res.render('./partials/error.ejs',{title:'url not found',userId});
});

app.listen(3000)