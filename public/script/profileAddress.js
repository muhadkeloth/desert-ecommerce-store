

function toggleEditForm(index){
    const displayAddress = document.getElementById('displayAddress' + index);
    const formedit = document.getElementById('formedit' + index);
    if(displayAddress.style.display === 'none'){
        displayAddress.style.display = 'block';
        formedit.style.display = 'none';
    }else{
        displayAddress.style.display = 'none';
        formedit.style.display = 'block';
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const toastElement = document.getElementById('toaster');
    if(toastElement){
        setTimeout(function () {
          const toast = new bootstrap.Toast(toastElement);
          toast.hide();
        }, 2000);
    }
  });


function createAddress(addresslength){
    if(parseInt(addresslength)  >= 5){        
        showAlert('Address form toggled successfully','danger')
    }else{
        const addAddressform = document.getElementById('addAddressform');
        addAddressform.style.display = (addAddressform.style.display === 'none') ? 'block' : 'none';
    }
}

function deleteAlert(index){
    if(window.confirm('Are you sure .it will remove address')){
        window.location.href = '/profileAddressdelete/' + index;
    }
}

function showAlert(content,type) {
    document.getElementById('alertContent').innerText = content;
    const alertElement = document.getElementById('myAlert');
    alertElement.classList.remove('alert-success','alert-danger','alert-info');
    alertElement.classList.add(`alert-${type}`)
    document.getElementById('alertContainer').style.display = 'block';
    setTimeout(function () {
        document.getElementById('alertContainer').style.display = 'none';
    }, 2000);
}


function createaddressvalidation(){
        const number = document.getElementById('number').value;
        const pincode = document.getElementById('pincode').value;
        const address = document.getElementById('address').value;
    
        let isValid =true;
    
        resetError();
    
        if(!/^\d+$/.test(number) || number.length !='10'){
            displayError('number','phone number must 10 digit.');
            isValid = false;
        }
        if(!/^\d+$/.test(pincode) || pincode.length !='6'){
            displayError('pincode','pincode must 6 digit.');
            isValid = false;
        }
        if(!address.length > 8 ){
            displayError('address','add valid address.');
            isValid = false;
        }
        
        return isValid;    
}

function editaddressvalidation(){
        const numberedit = document.getElementById('numberedit').value;
        const pincodeedit = document.getElementById('pincodeedit').value;
        const addressedit = document.getElementById('addressedit').value;
    
        let isValid =true;
    
        resetError();
    
        if(!/^\d+$/.test(numberedit) || numberedit.length !='10'){
            displayError('numberedit','phone number must 10 digit.');
            isValid = false;
        }
        if(!/^\d+$/.test(pincodeedit) || pincodeedit.length !='6'){
            displayError('pincodeedit','pincode must 6 digit.');
            isValid = false;
        }
        if(!addressedit.length > 8 ){
            displayError('addressedit','add valid address.');
            isValid = false;
        }
        
        return isValid;    
}

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

