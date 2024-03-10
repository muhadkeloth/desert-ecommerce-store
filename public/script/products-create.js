const checkboxes = document.querySelectorAll('.form-check-input');

checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', (event) => {
    const checkedCount = document.querySelectorAll('.form-check-input:checked').length;
    if (checkedCount > 4) {
      event.target.checked = false;
      alert('You can select a maximum of four colors.');
    }
  });
});




const imageButton = document.getElementById('imageButton');
const imageUpload = document.getElementById('imageUpload');
const previewContainer = document.getElementById('imagePreviewContainer');
const maxImages = 5;

imageButton.addEventListener('click', () => {
  imageUpload.click();
});

imageUpload.addEventListener('change', (event) => {
    const files = event.target.files;
  
    if (files) {
      if (files.length + previewContainer.querySelectorAll('img').length > maxImages) {
        alert(`You can only upload a maximum of ${maxImages} images.`);
        return;
      }
  
      const existingImages = imageUpload.files;
      const allFiles = [...existingImages, ...files];
  
      const newFileList = new DataTransfer();
  
      // Append each file to the new FileList
      allFiles.forEach(file => {
        newFileList.items.add(file);
      });
  
      // Assign the new FileList to the input's files property
      imageUpload.files = files;
  
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageElement = document.createElement('img');
          imageElement.classList.add('img-fluid', 'col-3', 'mb-3');
          imageElement.src = event.target.result;
          imageElement.dataset.imageId = file.name;
  
          const closeButton = document.createElement('button');
          closeButton.type = 'button';
          closeButton.classList.add('btn', 'btn-sm', 'btn-close', 'p-0');
          closeButton.innerHTML = '&times;';
          closeButton.dataset.imageId = file.name;
  
          const imageContainer = document.createElement('div');
          imageContainer.appendChild(imageElement);
          imageContainer.appendChild(closeButton);
          previewContainer.appendChild(imageContainer);
  
          closeButton.addEventListener('click', () => {
            const imageToRemove = document.querySelector(`img[data-image-id="${file.name}"]`);
            imageToRemove.parentNode.parentNode.removeChild(imageToRemove.parentNode);
  
            // Remove the file from the input when the close button is clicked
            const updatedFiles = [...imageUpload.files].filter(f => f.name !== file.name);
  
            // Create a new FileList and set it to the input's files property
            const updatedFileList = new DataTransfer();
            updatedFiles.forEach(updatedFile => {
              updatedFileList.items.add(updatedFile);
            });
            imageUpload.files = updatedFileList.files;
          });
        };
        reader.readAsDataURL(file);
      }
    }
  });   

  function productformValidation(){
    const title = document.getElementById('title').value;
    const subtitle = document.getElementById('subtitle').value;
    const description = document.getElementById('description').value;
    const brand = document.getElementById('brand').value;
    const mrp = document.getElementById('mrp').value;
    const colorCheckboxes = document.querySelectorAll('.form-check-input');
    const imageUploadInput = document.getElementById('imageUpload');

    let isValid = true;
  
    resetError();

    if(!title || title.length<5 ){      
        displayError('title',"Enter product title(atleast 5 charector)");
        isValid = false;
    }
    if(!subtitle){
        displayError('subtitle',"Enter product subtitle");
        isValid = false;
    }
    if(!description ){
        displayError('description',"Enter product description");
        isValid = false;
    }
    if(!brand ){
        displayError('brand',"Enter product brand Name");
        isValid = false;
    }
    if(!mrp ){
        displayError('mrp',"Enter product MRP");
        isValid = false;
    }

    let isAtLeastOneChecked = Array.from(colorCheckboxes).every(checkbox => !checkbox.checked);

    if(isAtLeastOneChecked){
    const errorElement = document.getElementById('checkboxError');
    errorElement.innerText = "Please select at least one color.";
    isValid = false;
    }
    if(imageUploadInput.files.length === 0){
        const errorElement = document.getElementById('imageError');
        errorElement.innerText = 'Please select at least one image.';
        isValid =false;
    }

    return isValid


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
    const inputElement = document.querySelectorAll('.form-control, #Checkbox');
    
    errorElement.forEach(element => element.innerText='')
    inputElement.forEach(element => element.classList.remove('border','border-danger'))
}