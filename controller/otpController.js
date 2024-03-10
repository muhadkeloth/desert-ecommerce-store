
const otpService = require('../services/otpService');
const Users = require('../models/userModel');


const otpvalidationland = (req,res) => {
    try{
        const {from, email } = req.query;
        if(from && email){
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
        const { otp, from } = req.body;
        if(from === 'signup'){
            const emailId =req.body.email;
            const storedOTP = otpService.getStoredOTP(emailId);
            if(!storedOTP){
                let email =emailId;
                return res.render('otpvalidation',{
                    title:"OTP Validation",
                    from,email,
                    message:'otpError',
                    error:{
                        message:'timeout please click resend button'
                    }
                })
            }
            const {email,userName,phoneNumber,password} = storedOTP;
            if(otpService.verifyOTP(otp,storedOTP.otp)){
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
        console.error('error in otp validation ',err);
    }
}


module.exports = { otpvalidationland, otpvalidationPost }