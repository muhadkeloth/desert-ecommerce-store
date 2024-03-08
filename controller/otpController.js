// const nodemailer = require('nodemailer')
// const otpGenerator = require('otp-generator');
const otpService = require('../services/otpService');
const Users = require('../models/userModel');




const otpvalidationland = (req,res) => {
    try{
        const {from, email } = req.query;
        console.log('otpland',from,email);
        if(from && email){
            console.log('otpland2',from,email);
            res.render('otpvalidation',{from,email,title:"OTP Validation"})
        }else{
            res.redirect('/');
        }
    }
    catch(err){
        console.error('error in otp validation route',err);
        res.status(500).redirect('/notfound')
    }
}

const otpvalidationPost = async (req,res) => {
    try{
        // const {email, otp, from } = req.query;
        console.log('otpvalidationpost',req.body);
        const { otp, from } = req.body;
        // const emailId = req.body.email;
        if(from === 'signup'){
            const emailId =req.body.email;
            const storedOTP = otpService.getStoredOTP(emailId);
            console.log('2',storedOTP);
            if(!storedOTP){
                let email =emailId;
                console.log('3');
                return res.render('otpvalidation',{
                    title:"OTP Validation",
                    from,email,
                    message:'otpError',
                    error:{
                        message:'timeout please click resend button'
                    }
                })
                //return send render otp with email,adn message to invalid otp
            }
            const {email,userName,phoneNumber,password} = storedOTP;
            console.log('5');
            console.log(storedOTP);
            if(otpService.verifyOTP(otp,storedOTP.otp)){
                console.log(storedOTP);
                const user =new Users({userName,email,phoneNumber,password});
                await user.save();
                res.redirect('/login')
            }else{
                return res.render('otpvalidation',{
                    title:"OTP Validation",
                    from,email,
                    message:'otpError',
                    error:{
                        message:'OTP Incorrect'
                    }
                })
               
            }
        }else if(from === 'forgotPassword'){
            const email = req.body.email;
            const storedOTP = otpService.getStoredOTP(email);
            if(!storedOTP){
                return res.render('otpvalidation',{
                    title:"OTP Validation",
                    from,email,
                    message:'otpError',
                    error:{
                        message:'timeout please click resend button'
                    }
                })
            }
            if(otpService.verifyOTP(otp,storedOTP.otp)){                
                // res.render('forgotPassChange',{email})
                res.redirect('/login')
            }else{
                return res.render('otpvalidation',{
                    title:"OTP Validation",
                    from,email,
                    message:'otpError',
                    error:{
                        message:'OTP Incorrect'
                    }
                })
            }
        }
    }
    catch(err){

    }
}







module.exports = {
    otpvalidationland,
    otpvalidationPost
}