const countdownElement = document.querySelector('.countdown');
// const countdownElement = document.getElementById('countdown');
let countdown = localStorage.getItem('countdown') ?? 120;
countdownElement.innerHTML = `0${countdown}`;
const countdownInterval = setInterval(() => {
    countdown--;
    countdownElement.innerHTML = `0${countdown}`;
    if(countdown === 1){
        clearInterval(countdownInterval);
        countdownElement.style.display = 'none';
        const otpResend = document.querySelector('.otpResend');
        otpResend.style.display = 'block';
        localStorage.removeItem('countdown');
    }else{
        localStorage.setItem('countdown',countdown);
    }
}, 1000);