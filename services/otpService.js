const nodemailer = require('nodemailer')
const otpGenerator = require('otp-generator');

let storedOTPs = {};

const StoreOtp =(email,otp,userName,phoneNumber,password) => {
    storedOTPs[email] = {email,otp,userName,phoneNumber,password};
    console.log('otpservice',storedOTPs);
    setTimeout(() => {
        storedOTPs = {};
    }, 120000);
}


const getStoredOTP = (email) => {
    return storedOTPs[email];
};


const verifyOTP = (enteredOTP, storedOTP) => {
    return enteredOTP === storedOTP;
};


const generateOTP = () => {
    return otpGenerator.generate(6,{lowerCaseAlphabets : false, upperCaseAlphabets: false, specialChars: false});
}


async function sendOTPEmail(email,otp,message){
    try{
        const {OTPMAIL_ID,OTPMAIL_PASS} = process.env;
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user: OTPMAIL_ID,
                pass: OTPMAIL_PASS
            }
        });
        const mailOptions = {
            from: OTPMAIL_ID,
            to:email,
            subject:`Desert OTP for ${message} `,
            text:`Your OTP is ${otp}. Please enter this code to ${message}`
        };
         await transporter.sendMail(mailOptions);
    }
    catch(err){
        console.log('error on otp sending signup',err.message)
    }
}


module.exports = {
    generateOTP,
    sendOTPEmail,
    verifyOTP,
    getStoredOTP,
    StoreOtp
}

