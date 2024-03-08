


function toggleStatus(userId) {
    const status = document.getElementById(`status_${userId}`).textContent.trim();
    const action = status === 'Active' ? 'InActive' : 'Active';
    const confirmationMessage = `Are you sure you want to ${action} this user?`;
    if(window.confirm(confirmationMessage)){
        fetch(`/admin/users/usertoggle/${userId}`, {
            method: 'PATCH'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(updatedUser => {
            const button = document.getElementById(`toggleButton_${userId}`);
            const status = document.getElementById(`status_${userId}`);
            if (button) {
                button.classList.remove('btn-outline-danger', 'btn-outline-success');
                button.classList.add(updatedUser.blockStatus ? 'btn-outline-danger' : 'btn-outline-success');
                button.innerHTML = updatedUser.blockStatus ? `<i class="bi bi-ban"></i>Block` : `<i class="bi bi-patch-check-fill"></i>UnBlock`;
            }
            if(status){
                status.classList.remove('text-succcess','text-danger');
                status.classList.add(updatedUser.blockStatus ? 'text-success' : 'text-danger');
                status.textContent = updatedUser.blockStatus ? 'Active' : 'InActive';
            }
        })
        .catch(err => {
            console.error('Error updating user status:', err);
        });
    }
}