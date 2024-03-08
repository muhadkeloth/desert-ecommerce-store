

const couponCodeInput = document.getElementById("couponcode");

    couponCodeInput.addEventListener("input", function() {
        this.value = this.value.toUpperCase();
    });

 
    function validateForm(){
        const title = document.getElementById('title').value;
        const couponcode = document.getElementById('couponcode').value;
        const startDateInput = document.getElementById("startdate");
        const expireDateInput = document.getElementById("expdate");
        const startDateValue = new Date(startDateInput.value);
        const expireDateValue = new Date(expireDateInput.value);

        let isValid = true;
      
        resetError();
    
        if(!title || title.length<5 ){      
            displayError('title',"Enter product title(atleast 5 charector)");
            isValid = false;
        }
        if(!couponcode){
            displayError('couponcode',"Enter coupon code");
            isValid = false;
        }
        if (expireDateValue < startDateValue) {
            displayError('expdate',"Expiration date cannot be before the start date.");
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

    const myModal = new bootstrap.Modal(document.getElementById('createModel'));
   function createCoupon(){
        if(myModal._isShown){
            myModal.hide();
        }else{
            myModal.show()
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


    //   start
    function toggleStatus(couponId){
        const status = document.getElementById(`status_${couponId}`).textContent.trim();
        const action = status === 'Listed' ? 'UnList' : 'List';
        const confirmationMessage = `Are you sure you want to ${action} this coupon?`;
        if(window.confirm(confirmationMessage)){
            fetch(`/admin/coupons/coupontoggle/${couponId}`, {
                method:'PATCH'
            })
            .then(res => {
                if(!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(updatedcoupon => {
                const button = document.getElementById(`toggleButton_${couponId}`);
                const status = document.getElementById(`status_${couponId}`);
                if(button){
                    button.classList.remove('btn-outline-danger', 'btn-outline-success');
                    button.classList.add(updatedcoupon.status ? 'btn-outline-danger' : 'btn-outline-success');
                    button.innerHTML = updatedcoupon.status ? `<i class="bi bi-ban">&nbsp;</i>UnList` : `<i class="bi bi-card-checklist">&nbsp;</i>List`;
                }
                if(status){
                    status.classList.remove('text-succcess','text-danger');
                    status.classList.add(updatedcoupon.status ? 'text-success' : 'text-danger');
                    status.textContent = updatedcoupon.status ? 'Listed' : 'UnListed';
                }
            })
            .catch(err => {
                console.error('Error updating coupon status ;',err);
            })
        }
    }
    
    function deleteCoupon(couponId){
        const confirmationMessage = `Are you sure you want to delete this coupon?`;
        if(window.confirm(confirmationMessage)){
            fetch('/admin/coupons/deletecoupon', {
                method:'DELETE',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({couponId})
            })
            .then(res => res.json())
            .then (data => {
                if(data.success){
                    const deleteRow = document.getElementById(`couponRow_${couponId}`);
                    deleteRow.parentNode.removeChild(deleteRow);
                    showAlert('coupon Successfully Deleted','success')
                }else{
                    console.error('error deleting coupon:', data.error);
                }
            })
            .catch(err => {
                console.error('error deleting coupon catch:',err);
            })
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