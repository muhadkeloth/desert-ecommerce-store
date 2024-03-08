
    function validateForm(){
        const title = document.getElementById('title');
        const titlevalue = title.value;
        let isValid = true;
      
        resetError();
    
        if(!titlevalue || titlevalue.length<5 ){      
            const errorElement = document.getElementById('titleError');    
            errorElement.innerText = "Enter product title(atleast 5 charector)";
            title.classList.add('border','border-danger');
            isValid = false;
        }
        return isValid;
    }

 
    
    // reset error when validation
    function resetError(){
        const errorElement = document.querySelectorAll('.error-message');
        const inputElement = document.querySelectorAll('.form-control');
        
        errorElement.forEach(element => element.innerText='')
        inputElement.forEach(element => element.classList.remove('border','border-danger'))
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

// end 

    const myModal = new bootstrap.Modal(document.getElementById('createModel'));
   function createOffer(){
        if(myModal._isShown){
            myModal.hide();
        }else{
            myModal.show()
        }
    }

        document.addEventListener('DOMContentLoaded', function(event) {
            // Fetch categories from MongoDB collection
            fetch('/admin/offers/findcategory')
                .then(response => response.json())
                .then(categories => {
                    const categorySelect = document.getElementById('categorySelect');
                    categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category._id;
                        option.textContent = category.categoryName;
                        categorySelect.appendChild(option);
                    });
                    categorySelect.dispatchEvent(new Event('change'));
                })
                .catch(error => console.error('Error fetching categories:', error));
        
            // Add event listener for category select change
            document.getElementById('categorySelect').addEventListener('change', function() {
                const categoryId = this.value;
                fetch(`/admin/offers/findproducts/${categoryId}/products`)
                    .then(response => response.json())
                    .then(products => {
                        const productSelect = document.getElementById('productSelect');
                        productSelect.innerHTML = '';
                        products.forEach(product => {
                            const option = document.createElement('option');
                            option.value = product._id;
                            option.textContent = product.title;
                            productSelect.appendChild(option);
                        });
                    })
                    .catch(error => console.error('Error fetching products:', error));
            });
            });
 

    //   start
    function toggleStatus(offerId){
        const status = document.getElementById(`status_${offerId}`).textContent.trim();
        const action = status === 'Listed' ? 'UnList' : 'List';
        const confirmationMessage = `Are you sure you want to ${action} this offer?`;
        if(window.confirm(confirmationMessage)){
            fetch(`/admin/offers/offertoggle/${offerId}`, {
                method:'PATCH'
            })
            .then(res => {
                if(!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(updatedoffer => {
                const button = document.getElementById(`toggleButton_${offerId}`);
                const status = document.getElementById(`status_${offerId}`);
                if(button){
                    button.classList.remove('btn-outline-danger', 'btn-outline-success');
                    button.classList.add(updatedoffer.status ? 'btn-outline-danger' : 'btn-outline-success');
                    button.innerHTML = updatedoffer.status ? `<i class="bi bi-ban">&nbsp;</i>UnList` : `<i class="bi bi-card-checklist">&nbsp;</i>List`;
                }
                if(status){
                    status.classList.remove('text-succcess','text-danger');
                    status.classList.add(updatedoffer.status ? 'text-success' : 'text-danger');
                    status.textContent = updatedoffer.status ? 'Listed' : 'UnListed';
                }
            })
            .catch(err => {
                console.error('Error updating offer status ;',err);
            })
        }
    }
    
    function deleteoffer(offerId){
        const confirmationMessage = `Are you sure you want to delete this offer?`;
        if(window.confirm(confirmationMessage)){
            fetch('/admin/offers/deleteoffer', {
                method:'DELETE',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({offerId})
            })
            .then(res => res.json())
            .then (data => {
                if(data.success){
                    const deleteRow = document.getElementById(`offerRow_${offerId}`);
                    deleteRow.parentNode.removeChild(deleteRow);
                    showAlert('offer Successfully Deleted','success')
                }else{
                    console.error('error deleting offer:', data.error);
                }
            })
            .catch(err => {
                console.error('error deleting offer catch:',err);
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