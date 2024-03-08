const bcrypt = require('bcrypt');
// const nodemailer = require('nodemailer')
// const otpGenerator = require('otp-generator');
const Users = require('../models/userModel');
const otpService = require('../services/otpService')
// const Mail = require('nodemailer/lib/mailer');

let otp,otpchangepass;


const loginland = (req,res) => {
    try{
        if(!req.session?.user){
            res.render('login.ejs',{title:"login page"});
        }else{
            res.redirect('/');
        }
    }catch(err){
        console.log(err.message);
    }
};

const loginPost = async (req,res) => {
    try{
        const {email,password} = req.body;
        const user = await Users.findOne({email});
        if(!user) {
            return res.render('login', {
                title:"signup",
                message:'emailError',
                error:{
                    message:'email not found'
                }
            })
        }if(!user.blockStatus){
            return res.render('login', {
                title:"signup",
                message:'emailError',
                error:{
                    message:'email blocked by Admin'
                }
            })
        }
        const passwordMatch = await bcrypt.compare(password,user.password);
        const useremail = user.email;
        if(!passwordMatch){
            return res.render('login', {
                title:"signup",
                useremail:useremail,
                message:'passwordError',
                error:{
                    message:'password Incorrect'
                }
            })
        }
        // if(!user.blockStatus){
        //     res.redirect('/logout');
        // }
        req.session.user = user._id;
        // res.render('homepage',user)
        res.redirect('/');


    }
    catch(err){
        console.log('error on loginpost',err);
    }

};

const signupland = (req,res) => {
    if(req.session?.user){
        res.redirect('/');
    }else{
        res.render('signup',{title:"signup"});
    }
};

const signupPost = async (req,res) => {
    try{        
        const {userName,email,phoneNumber,password} = req.body;
        const query = { $or : [{email},{phoneNumber}] };
        const existuser = await Users.findOne(query);
        if(!existuser){
          
            if(!otp){
                otp = otpService.generateOTP();
                const hashedPassword = await bcrypt.hash(password,10);
                otpService.StoreOtp(email,otp,userName,phoneNumber,hashedPassword);
                otpService.sendOTPEmail(email,otp,'verify your account');
                setTimeout(() => {
                    otp = null;
                }, 120000);
                res.redirect('/otpvalidation?from=signup&email=' + email);
            }else{
                res.redirect('/otpvalidation?from=signup&email=' + email)
            }
   
        }else{
            if(existuser.email === email){
               return res.render('signup',{
                title:"signup",
                    message:'emailError',
                    error:{
                        message:'email taken'
                    }
                })
            }else{
                // if(existuser.phoneNumber === phoneNumber)
                return res.render('signup',{
                    title:"signup",
                    message:'phoneError',
                    error:{
                        message:'phone number taken'
                    }
                })
            }
        }
    }
    catch(err){
        console.log('signuppost error');
    }
};
       

const forgotPasswordland =  (req,res) => {
    if(!req.session?.user) {
        res.render('forgotPassword',{title:"forgot Password"})
    }else{
        res.redirect('/');
    }
};

const forgotPasswordPost = async (req,res) => {
    try{
        console.log(req.body);
        const email =req.body.email;
        const user = await Users.findOne({email});
        console.log(user);
        if(!user){
            return res.render('forgotPassword',{
                title:"forgot Password",
                message:'emailError',
                error:{
                    message:'email not registered'
                }
            })
        }
        if(!otpchangepass){
            otpchangepass = otpService.generateOTP();
            otpService.StoreOtp(email,otpchangepass);
            otpService.sendOTPEmail(email,otpchangepass,'reset your password');
            setTimeout(() => {
                otpchangepass = null;
            }, 120000);
            res.redirect('/otpvalidation?from=forgotPassword&email=' + email);
        }else{
            res.redirect('/otpvalidation?from=forgotPassword&email=' + email);
        }
    }
    catch(err){
        console.log('forgotpassweordpost error');
        // res.render('otpvalidation')
    }
};

const forgotPassChangePost = async (req,res) => {
    try{
        const {email,password} = req.body;
        const hashedPassword = await bcrypt.hash(password,10);
        const user = await Users.findOneAndUpdate(
            {email},
            {$set:{password:hashedPassword}},
            {new:true}
        );
        if(!user){
            console.log('updateforgotpassworderror');
        }else{
            console.log('userpasswordupdated');
            res.redirect('/login')
        }
    }
    catch(err){
        console.log('forgotpasswordchange error',err.message);
    }
}






module.exports = {
    loginland,
    loginPost,
    signupland,
    signupPost,
    forgotPasswordland,
    forgotPasswordPost,
    forgotPassChangePost
    
}
