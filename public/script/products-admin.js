
document.addEventListener('DOMContentLoaded', function () {
    const toastElement = document.getElementById('toaster');
    if(toastElement){
        setTimeout(function () {
          const toast = new bootstrap.Toast(toastElement);
          toast.hide();
        }, 2000);
    }
  });

function toggleStatus(productId){
    const status = document.getElementById(`status_${productId}`).textContent.trim();
    const action = status === 'Listed' ? 'UnList' : 'List';
    const confirmationMessage = `Are you sure you want to ${action} this product?`;
    if(window.confirm(confirmationMessage)){
        fetch(`/admin/products/producttoggle/${productId}`, {
            method:'PATCH'
        })
        .then(res => {
            if(!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(updatedproduct => {
            const button = document.getElementById(`toggleButton_${productId}`);
            const status = document.getElementById(`status_${productId}`);
            if(button){
                button.classList.remove('btn-outline-danger', 'btn-outline-success');
                button.classList.add(updatedproduct.Status ? 'btn-outline-danger' : 'btn-outline-success');
                button.innerHTML = updatedproduct.Status ? `<i class="bi bi-ban">&nbsp;</i>UnList` : `<i class="bi bi-card-checklist">&nbsp;</i>List`;
            }
            if(status){
                status.classList.remove('text-succcess','text-danger');
                status.classList.add(updatedproduct.Status ? 'text-success' : 'text-danger');
                status.textContent = updatedproduct.Status ? 'Listed' : 'UnListed';
            }
            showAlert('successfully updated Status','success')
            
        })
        .catch(err => {
            console.error('Error updating product status ;',err);
        })
    }
}

function deleteCategory(productId){
    const confirmationMessage = `Are you sure you want to delete this product?`;
    if(window.confirm(confirmationMessage)){
        fetch('/admin/products/deleteProduct', {
            method:'DELETE',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({productId})
        })
        .then(res => res.json())
        .then (data => {
            if(data.success){
                const deleteRow = document.getElementById(`productRow_${productId}`);
                deleteRow.parentNode.removeChild(deleteRow);
                showAlert('Products Successfully Deleted','success')
            }else{
                console.error('error deleting Products:', data.error);
            }
        })
        .catch(err => {
            console.error('error deleting Products catch:',err);
        })
    }
}

function product_Edit(productId){
    console.log(productId);
    const form = document.createElement('form');
    form.method = 'GET';
    form.action =`/admin/products/editProduct/${productId}`;
    document.body.appendChild(form);
    form.submit()
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

function createProduct(){
    window.location.href = '/admin/products/createProduct';
}