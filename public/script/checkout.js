
function goBack() {
    window.history.back();
    }

function toggleShippingRow(){
    const shippingRow = document.getElementById('shippingRow');
    if(shippingRow.style.display === 'none'){
        const totalAmount = document.getElementById('totalAmount');
        const totalPrice = document.getElementById('totalPrice');
        totalPrice.value = parseInt(totalPrice.value) + 40;
        totalAmount.innerText = parseInt(totalAmount.innerText) + 40 ;
        shippingRow.style.display = 'table-row';
    }
   }

function submitorder(){
    const selectedaddress = document.querySelector('input[name="address"]:checked');
    const selectedpayment = document.querySelector('input[name="pay-method"]:checked');
    if(!selectedaddress){
        const toasteres = document.getElementById("toasteres")
        const tosterbodys = document.getElementById("tosterbodys");
        toasteres.classList.remove('text-bg-danger','text-bg-success');
        toasteres.classList.add('text-bg-danger','show');
        tosterbodys.innerText = 'Please select delivery address and payment mode';
        setTimeout(() => {
            toasteres.classList.remove('show');
        }, 2000);
    }else{
        const totalPrice = document.getElementById('totalAmount').textContent;
        if(parseInt(totalPrice) === 0){            
            const orderconfirm = new bootstrap.Modal(document.getElementById('orderconfirm')) 
            orderconfirm.show();
            return; 
        }else if(parseInt(totalPrice) > 10000 && selectedpayment.value === 'COD' ){
            const toasteres = document.getElementById("toasteres")
            const tosterbodys = document.getElementById("tosterbodys");
            toasteres.classList.remove('text-bg-danger','text-bg-success');
            toasteres.classList.add('text-bg-danger','show');
            tosterbodys.innerText = 'COD not applicable above 10000';
            setTimeout(() => {
                toasteres.classList.remove('show');
            }, 2000);
            return;
        }
        if(selectedpayment.value === 'RAZORPAY'){
            const cartdocs = document.getElementById('cartdocs').value;
            fetch('/paymentsetup',{
                method:'POST',
                headers: {'Content-Type': 'application/json' },
                body:JSON.stringify({totalPrice, cartdocs})
            })
            .then(res => res.json())
            .then(data => {
                if(data){
                    if(data.success){
                        const options = {
                            key:data.key_id,
                            amount:data.amount,
                            currency: 'INR',
                            name: data.product_name,
                            description:data.description,
                            image:'./img/desert-logos_black_croped.png',
                            order_id: data.order_id,
                            handler:function(res){
                                confirmorder();
                            },
                            prefill: {
                                contact: data.contact,
                                name: data.name,
                                email: data.email
                            },
                            notes: {
                                description: data.description
                            },
                            theme: {
                                color: '#f45801'
                            }
                        };
            
                        const razorpayObject = new Razorpay(options);

                            razorpayObject.on('payment.failed', function(response){
                                const status ='PAYMENT_FAILED';
                                confirmorder(status);
                            });
                            razorpayObject.open();
                    }else{
                        alert('error: ' + data.msg);
                    }
                }
              })    
              .catch(err => {
                console.error('error order in razorpay confirm:',err);
              })
        }else{
            const orderconfirm = new bootstrap.Modal(document.getElementById('orderconfirm')) 
            orderconfirm.show(); 
        }
    }
}


function confirmorder(status = undefined){
    const selectedaddress = document.querySelector('input[name="address"]:checked').value;
    let selectedpayment = document.querySelector('input[name="pay-method"]:checked').value;
    const cartdocs = document.getElementById('cartdocs').value;
    const totalPrice = document.getElementById('totalAmount').textContent;
    const walletdedect = document.getElementById('walletdedect').value;
    const couponCode = document.getElementById('couponCode').value;
    if(totalPrice === '0'){
        selectedpayment = 'WALLET';
    }
    fetch('/confirmorder',{
        method:'POST',
        headers: {'Content-Type': 'application/json' },
        body:JSON.stringify({ selectedaddress, selectedpayment,cartdocs,status, totalPrice,walletdedect, couponCode })
    })
    .then(res => res.json())
  .then(data => {
    if(data.success){
        const orderconfirmation = new bootstrap.Modal(document.getElementById('greeting')) 
        orderconfirmation.show();  
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    }else if(!data.success){
        const toasteres = document.getElementById("toasteres")
        const tosterbodys = document.getElementById("tosterbodys");
        toasteres.classList.remove('text-bg-danger','text-bg-success');
        toasteres.classList.add('text-bg-danger','show');
        tosterbodys.innerText = data.message ;
        setTimeout(() => {
            toasteres.classList.remove('show');
            window.location.href = '/orders';
        }, 2000);
    }
  })    
  .catch(err => {
    console.error('error order confirm:',err);
  })
}


const couponCodeInput = document.getElementById("couponCode");

    couponCodeInput.addEventListener("input", function() {
        this.value = this.value.toUpperCase();
    });


function couponapply(){
    const couponCode = document.getElementById('couponCode').value;
      
    resetError();

    if(!couponCode){
        displayError('couponCode',"Enter coupon code");
        return;
    }

    fetchcoupon(couponCode);
}

function displayError(field,message){
    const errorElement = document.getElementById(field + 'Error');
    const inputElement = document.getElementById(field);

    errorElement.innerText = message;
    inputElement.classList.add('border','border-danger');
}

function resetError(){
    const errorElement = document.querySelectorAll('.error-message');
    const inputElement = document.querySelectorAll('.form-control');
    
    errorElement.forEach(element => element.innerText='')
    inputElement.forEach(element => element.classList.remove('border','border-danger'))
}

let couponMaxDiscount = 0;

function fetchcoupon(couponCode){
    const totalCartValue = document.getElementById('totalPrice').value;
    resetError();
  
    fetch('/checkout/couponvalidation', {
        method:'POST',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({ couponCode, totalCartValue })
    })
    .then(res => res.json())
            .then (data => {
                if(!data.result){
                    const couponCode = document.getElementById('couponCode');
                    couponCode.value = '';
                    displayError('couponCode',data.message);
                }else{
                    const discountRow = document.getElementById('discountRow');
                    const discountAmount = document.getElementById('discountAmount');
                    const maxAmountInCoupon = document.getElementById('maxAmountInCoupon');
                    const couponsearch = document.getElementById('couponsearch');
                    couponsearch.style.display = 'none';
                    discountRow.style.display = 'table-row';
                    discountAmount.textContent = `${data.coupon.percentage}`;
                    maxAmountInCoupon.textContent = `(max:${data.coupon.maxDiscount})`;

                    const totalAmount = document.getElementById('totalAmount');
                    const totalPrice = document.getElementById('totalPrice');
                    const walletchecker = document.getElementById('flexSwitchCheckDefault');
                    const walletdedect = document.getElementById('walletdedect');
                    let newTotal = ((parseInt(totalPrice.value) * (parseInt(data.coupon.percentage)/100)) > data.coupon.maxDiscount) ? parseInt(totalPrice.value) - data.coupon.maxDiscount : parseInt(totalPrice.value) * (1 - parseInt(data.coupon.percentage) /100);
                    couponMaxDiscount = data.coupon.maxDiscount;
                    if(walletchecker.checked){
                        const walletAmount = document.getElementById('walletAmount');
                        if(newTotal <= walletchecker.value){
                            walletdedect.value = newTotal;
                            walletAmount.textContent = walletdedect.value;
                            newTotal = 0;
                        }else{
                            walletdedect.value = walletchecker.value;
                            walletAmount.textContent = walletdedect.value;
                            newTotal = newTotal - walletchecker.value;
                        } 
                        totalAmount.textContent =  newTotal;                   
                    }else{
                        totalAmount.textContent =  newTotal;
                    }
                }
            })
            .catch(err => {
                console.error('error fetching  coupon:',err);
            })
}

function hideCoupondiv(totalbase){
    const discountRow = document.getElementById('discountRow');
    const discountAmount = document.getElementById('discountAmount');
    const maxAmountInCoupon = document.getElementById('maxAmountInCoupon');
    const totalAmount = document.getElementById('totalAmount');
    const couponsearch = document.getElementById('couponsearch');
    const walletchecker = document.getElementById('flexSwitchCheckDefault');
    const walletdedect = document.getElementById('walletdedect');
    const walletAmount = document.getElementById('walletAmount');
    const couponCode = document.getElementById('couponCode');
    const shippingRow = document.getElementById('shippingRow');
    totalbase = (shippingRow.style.display !== 'none') ? parseInt(totalbase) + 40 : totalbase;
    couponsearch.style.display = 'table-row';
    couponCode.value = '';
    discountRow.style.display = 'none';
    discountAmount.textContent = ``;
    maxAmountInCoupon.textContent = ``;
    if(walletchecker.checked){
        if(parseInt(totalbase) <= walletchecker.value){
            walletdedect.value = parseInt(totalbase);
            walletAmount.textContent = walletdedect.value;
            totalbase = 0;
        }else{
            walletdedect.value = walletchecker.value;
            walletAmount.textContent = walletdedect.value;
            totalbase = parseInt(totalbase) - walletdedect.value;
        }
        totalAmount.textContent = totalbase;
    }else{
        totalAmount.textContent = totalbase;
    }
}

let switchCheckbox;
if(document.getElementById('flexSwitchCheckDefault')){
    switchCheckbox = document.getElementById('flexSwitchCheckDefault');
    switchCheckbox.addEventListener('change', fetchData);
}

function fetchData() {
    const isChecked = switchCheckbox?.checked;

    if (isChecked) {
        fetchCheckedData();
    } else {
        fetchUncheckedData();
    }
}

function fetchCheckedData() {
    const totalAmount = document.getElementById('totalAmount');
    const totalPrice = document.getElementById('totalPrice');
    const walletRow = document.getElementById('walletRow');
    const walletAmount = document.getElementById('walletAmount');
    const discountAmount = document.getElementById('discountAmount');
    walletRow.style.display = 'table-row'; 
    if(discountAmount.textContent){
        const walletdedect = document.getElementById('walletdedect');
        
        const coupondeductedprice = ((parseInt(totalPrice.value) * (parseInt(discountAmount.textContent)/100)) > couponMaxDiscount) ? parseInt(totalPrice.value) - couponMaxDiscount : parseInt(totalPrice.value) * (1 - (parseInt(discountAmount.textContent)) /100);
        if(coupondeductedprice <= switchCheckbox.value){
            totalAmount.textContent = 0;
            walletdedect.value = coupondeductedprice;
            walletAmount.textContent = coupondeductedprice;
        }else{
            totalAmount.textContent = coupondeductedprice - switchCheckbox.value;
            walletAmount.textContent = switchCheckbox.value;
            walletdedect.value = switchCheckbox.value;
        }
    }else{
        if(parseInt(totalPrice.value) <= switchCheckbox.value){
            totalAmount.textContent = 0;
            walletdedect.value = parseInt(totalPrice.value);
            walletAmount.textContent = parseInt(totalPrice.value);
        }else{
            totalAmount.textContent = parseInt(totalPrice.value) - switchCheckbox.value;
            walletAmount.textContent = switchCheckbox.value;
            walletdedect.value = switchCheckbox.value;
        }
    }
}

function fetchUncheckedData() {
    const totalAmount = document.getElementById('totalAmount');
    const totalPrice = document.getElementById('totalPrice');
    const walletRow = document.getElementById('walletRow');
    const walletAmount = document.getElementById('walletAmount');
    const discountAmount = document.getElementById('discountAmount');
    const walletdedect = document.getElementById('walletdedect');
    
    walletRow.style.display = 'none';
    walletAmount.textContent = '';
    walletdedect.value = 0;

    if(discountAmount.textContent){
        totalAmount.textContent = ((parseInt(totalPrice.value) * (parseInt(discountAmount.textContent)/100)) > couponMaxDiscount) ? parseInt(totalPrice.value) - couponMaxDiscount : parseInt(totalPrice.value) * (1 - (parseInt(discountAmount.textContent)) /100);
    }else{
        totalAmount.textContent = parseInt(totalPrice.value);
    }    
}
