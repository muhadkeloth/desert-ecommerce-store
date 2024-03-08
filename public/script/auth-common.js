// validate signup form
function validateForm(){
    const userName = document.getElementById('userName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const ConfirmPassword = document.getElementById('ConfirmPassword').value;

    let isValid =true;

    resetError();

    if(!userName){
        displayError('userName','Enter User Name.');
        isValid = false;
    }
    if(!email.length){
        displayError('email','Plese Enter a Valid Email.');
        isValid = false;
    }
    // console.log(phoneNumber.length);
    if(!/^\d+$/.test(phone) || phone.length !='10'){
        displayError('phone','Phone Number Invalid.');
        isValid = false;
    }
    if(/\s/.test(password) || password.length < 8 || password === userName || password === email){
        displayError('password','password Error try another.');
        isValid = false;
    }
    if(ConfirmPassword.length == 0){
        displayError('ConfirmPassword','Please Enter Password.');
        isValid =false;
    }else if(ConfirmPassword !=password){
        displayError('ConfirmPassword','Password Not Match');
        isValid =false;
    }

    return isValid;    
}

// validate login form
function loginValidate(){
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    let isValid = true;

    resetError();
    
    if(!email.length){
        displayError('email','Please Enter Valid Email Address.');
        isValid = false;
    }

    if(/\s/.test(password) || password.length < 8 || password === email){
        displayError('password','password Incorrect');
        isValid = false;     
    }

    return isValid;
}

// otp validation
function validateOtp(){
    const otp = document.getElementById('otp').value;
    
    let isValid = true;

    resetError();

    if(otp.length !== 6 || !/^\d+$/.test(otp)){
        displayError('otp','Entered OTP mismatch');
        isValid = false;
    }

    return isValid;
}

function validateEmailForgot(){
    const email = document.getElementById('email').value;

    let isValid = true;

    resetError();

    if(!email.length){
        displayError('email','Please Enter Valid Email Address.');
        isValid = false;
    }

    return isValid;
}

function validatepasschange(){
    const password = document.getElementById('password').value;
    const ConfirmPassword = document.getElementById('ConfirmPassword').value;

    let isValid =true;

    resetError();

    if(/\s/.test(password) || password.length < 8 || password === userName || password === email){
        displayError('password','password Error try another.');
        isValid = false;
    }
    if(ConfirmPassword.length == 0){
        displayError('ConfirmPassword','Please Enter Password.');
        isValid =false;
    }else if(ConfirmPassword !=password){
        displayError('ConfirmPassword','Password Not Match');
        isValid =false;
    }

    return isValid;  
}

// display validate error message to user
function displayError(field,message){
    const errorElement = document.getElementById(field + 'Error');
    const inputElement = document.getElementById(field);

    errorElement.innerText = message;
    inputElement.classList.add('border','border-danger');
}

// reset error when validation
function resetError(){
    const errorElement = document.querySelectorAll('.error-message');
    const inputElement = document.querySelectorAll('.form-control');
    
    errorElement.forEach(element => element.innerText='')
    inputElement.forEach(element => element.classList.remove('border','border-danger'))
}

// logo banner route to home
function goToHome(){
    window.location.href = '/';
}

