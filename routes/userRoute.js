const express = require('express');
const userRoute = express();

const userController = require('../controller/userController');
const otpController = require('../controller/otpController');
const homeusers = require('../controller/home-users');
const auth = require('../middlewares/Auth')

userRoute.set('view engine','ejs')
userRoute.set('views','./views/user')


userRoute.get('/login',userController.loginland);
userRoute.post('/login',userController.loginPost);

userRoute.get('/signup',userController.signupland);
userRoute.post('/signup',userController.signupPost);

userRoute.get('/otpvalidation',otpController.otpvalidationland)
userRoute.post('/otpvalidation',otpController.otpvalidationPost)

userRoute.post('/forgotPassChange',userController.forgotPassChangePost)

userRoute.get('/forgotPassword',userController.forgotPasswordland);
userRoute.post('/forgotPassword',userController.forgotPasswordPost);

// userhome
userRoute.get('/',homeusers.homeland);
userRoute.get('/productlist',homeusers.productlists);
userRoute.get('/productdetails',homeusers.productdetails);

// profile
userRoute.get('/profile',auth.userAuthdash,homeusers.profileland);
userRoute.get('/profileEdit',auth.userAuthdash,homeusers.profileEditland);
userRoute.post('/profileEdit',auth.userAuthtologin,homeusers.profileEditPost);
userRoute.get('/profilechangepassword',auth.userAuthtologin,homeusers.profilechangepasswordland);
userRoute.post('/profilechangepassword',auth.userAuthtologin,homeusers.profilechangepasswordpost);
userRoute.get('/profileAddress',auth.userAuthtologin,homeusers.profileAddressland);
userRoute.post('/profileAddressCreate',auth.userAuthtologin,homeusers.profileAddressCreatepost);
userRoute.post('/profileAddressedit',auth.userAuthtologin,homeusers.profileAddresseditpost);
userRoute.get('/profileAddressdelete/:index',auth.userAuthtologin,homeusers.profileAddressdeleteland);

// cart manage
userRoute.get('/cart',auth.userAuthtologin,homeusers.cartland);
userRoute.post('/addtocart',auth.userAuthtologin,homeusers.addtocartpost);
userRoute.post('/decrementIncrementCart',auth.userAuthtologin,homeusers.decrementIncrementCartpost);
userRoute.delete('/cartitemdelete',auth.userAuthtologin,homeusers.cartitemdeletedelete);
userRoute.get('/cartcount',auth.userAuthtologin,homeusers.cartcountland);

// checkout
userRoute.get('/checkout',auth.userAuthtologin,homeusers.checkoutland);
userRoute.post('/confirmorder',auth.userAuthtologin,homeusers.confirmorder);
userRoute.post('/paymentsetup',auth.userAuthtologin,homeusers.paymentsetup);
userRoute.post('/checkout/couponvalidation',auth.userAuthtologin,homeusers.couponvalidationpost);

// order manager
userRoute.get('/orders',auth.userAuthtologin,homeusers.ordersland)
userRoute.get('/orderdetails',auth.userAuthtologin,homeusers.orderdetailsland)
userRoute.post('/orderdetails/repayment',auth.userAuthtologin,homeusers.repayment)
userRoute.post('/orderdetails/updateorderStatus',auth.userAuthtologin,homeusers.updateorderStatus)
userRoute.post('/ordercancel',auth.userAuthtologin,homeusers.ordercancelpost)


// wishlist
userRoute.get('/wishlist',auth.userAuthtologin,homeusers.wishlistland)
userRoute.post('/addtowishlist',auth.userAuthtologin,homeusers.wishlistadd)
userRoute.get('/wishlistcount',auth.userAuthtologin,homeusers.wishlistcountland);
userRoute.delete('/wishlistitemdelete',auth.userAuthtologin,homeusers.wishlistitemdelete);


// wallet
userRoute.get('/wallet',auth.userAuthtologin,homeusers.walletland)



// logout
userRoute.get('/logout',homeusers.logout);



module.exports = userRoute;

