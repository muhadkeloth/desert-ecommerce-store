
function toggleStatus(categoryId){
    const status = document.getElementById(`status_${categoryId}`).textContent.trim();
    const action = status === 'Listed' ? 'UnList' : 'List';
    const confirmationMessage = `Are you sure you want to ${action} this category?`;
    if(window.confirm(confirmationMessage)){
        fetch(`/admin/category/categorytoggle/${categoryId}`, {
            method:'PATCH'
        })
        .then(res => {
            if(!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(updatedCategory => {
            const button = document.getElementById(`toggleButton_${categoryId}`);
            const status = document.getElementById(`status_${categoryId}`);
            if(button){
                button.classList.remove('btn-outline-danger', 'btn-outline-success');
                button.classList.add(updatedCategory.Status ? 'btn-outline-danger' : 'btn-outline-success');
                button.innerHTML = updatedCategory.Status ? `<i class="bi bi-ban">&nbsp;</i>UnList` : `<i class="bi bi-card-checklist">&nbsp;</i>List`;
            }
            if(status){
                status.classList.remove('text-succcess','text-danger');
                status.classList.add(updatedCategory.Status ? 'text-success' : 'text-danger');
                status.textContent = updatedCategory.Status ? 'Listed' : 'UnListed';
            }
        })
        .catch(err => {
            console.error('Error updating category status ;',err);
        })
    }
}

function deleteCategory(categoryId){
    const confirmationMessage = `Are you sure you want to delete this product?`;
    if(window.confirm(confirmationMessage)){
        fetch('/admin/category/deleteCategory', {
            method:'DELETE',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({categoryId})
        })
        .then(res => res.json())
        .then (data => {
            if(data.success){
                const deleteRow = document.getElementById(`categoryRow_${categoryId}`);
                deleteRow.parentNode.removeChild(deleteRow);
                showAlert('Category Successfully Deleted','success')
            }else{
                console.error('error deleting category:', data.error);
            }
        })
        .catch(err => {
            console.error('error deleting category catch:',err);
        })
    }
}

const createModal = new bootstrap.Modal(document.getElementById('createModel'));
const editModel = new bootstrap.Modal(document.getElementById('editModel'));


function toggleModal(myModal){
    if(myModal._isShown){
        myModal.hide();
    }else{
        myModal.show()
    }
}

function editCategory(categoryId,categoryName){
      document.getElementById('editCategoryId').value = categoryId;
      document.getElementById('editCategoryName').value = categoryName;
    toggleModal(editModel)   
}

function createCategory(){
    toggleModal(createModal)
}


function saveEditedCategory(){
    const categoryId = document.getElementById('editCategoryId').value;
        const categoryName = document.getElementById('editCategoryName').value;
        fetch('/admin/category/updateCategory',{
            method:'PUT',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({categoryId,categoryName})
        })
        .then(res => res.json())
        .then(data =>{
            if(data.result === true){
                const categoryNameElement = document.getElementById(`categoryName_${categoryId}`);
                categoryNameElement.innerText = categoryName;
                showAlert('Category Name Successfully edited','success')
                toggleModal(editModel);                
            }else{
                showAlert('Category Name already exist','danger')
            }
        })
        .catch(err => {
            console.error('error saving edited categor catchy:',err);
        })
}


function saveCategory(){
    const createcategory = document.getElementById('createCategoryName').value;
    fetch('/admin/category/createCategory',{
        method:'POST',
        headers:{
         'Content-Type':'application/json'
                },
        body:JSON.stringify({createcategory:createcategory})
    })
    .then(res=> res.json())
    .then(data=>{
        if(data.result === 'notUnique'){
            showAlert('Category Name Already Exists','danger')
            toggleModal(createModal);
        }else if(data.result === true){
            showAlert('Category Name Successfully Added','success')
            toggleModal(createModal);

        }
    })
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

