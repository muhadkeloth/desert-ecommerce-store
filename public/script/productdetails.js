


const sizeSelect = document.getElementById('sizeSelect');
let stockdetails = document.getElementById('stockdetails').value;
const parsedStockDetails = JSON.parse(stockdetails);
for (let size in parsedStockDetails) {
  if (parsedStockDetails.hasOwnProperty(size)) {
    let option = document.createElement('option');
    option.value = size.replace('size', ''); // Extract the size value
    option.text = option.value;

    // Check if the size is in parsedStockDetails
    if (parsedStockDetails[size] > 0) {
      sizeSelect.appendChild(option);

    } else {
      option.disabled = true; // Disable the option
      option.style.opacity = 0.5; // Set opacity for disabled option
      option.text += ' - Out of Stock'; // Add out of stock message
      option.classList.add('text-danger');
      sizeSelect.appendChild(option);
    }
  }
}


// img sub in to main image
function changeMainImg(imagesrc){
const mainImage = document.getElementById('mainImage');
const zoomimg = document.getElementById('zoomimg');
mainImage.src = '/assets/uploads/' + imagesrc;
zoomimg.style.backgroundImage = 'url("/assets/uploads/' + imagesrc + '")';
}
// increment and decrement quantity of product
function incrementqty(){
const qtyInput = document.getElementById('qty');
let currentqty = parseInt(qtyInput.value);
if(currentqty < 5){
  qtyInput.value = ++currentqty;
}
}
function decrementqty(){
const qtyInput = document.getElementById('qty');
let currentqty = parseInt(qtyInput.value);
if(currentqty > 1){
  qtyInput.value = --currentqty;
}
}



function goBack() {
window.history.back();
}

function addtocart(productId){
  const size = document.getElementById('sizeSelect').value;
  const qty = document.getElementById('qty').value;
  const data = {
    size:size,qty:qty
  }
  console.log(data);
  fetch('/addtocart?productId=' + productId,{
    method: 'POST',
     headers: {'Content-Type': 'application/json' },
    body:JSON.stringify(data)
  })
  .then(res => res.json())
  .then(data => {
    if(data.result === true){
        const toaster = document.getElementById('toaster');
        const tosterbody = document.getElementById('tosterbody');
        toaster.classList.remove('hide');
        toaster.classList.add('show','text-bg-success');
        tosterbody.innerText = data.message;               
        setTimeout(() => {
          toaster.classList.remove('show','text-bg-success');
          toaster.classList.add('hide');
        }, 2000);
      }else{
        const toaster = document.getElementById('toaster');
        const tosterbody = document.getElementById('tosterbody');
        toaster.classList.remove('hide');
        toaster.classList.add('show','text-bg-danger');
        tosterbody.innerText = data.message; 
        setTimeout(() => {
          toaster.classList.remove('show','text-bg-danger');
          toaster.classList.add('hide');
        }, 2000);
    }
  })
  .catch(err => {
    console.error('error addingcart:',err);
  })

}

function addtowishlist(productId){
  const size = document.getElementById('sizeSelect').value;
  const qty = document.getElementById('qty').value;
  const data = {
    size:size,qty:qty
  }
  fetch('/addtowishlist?productId=' + productId,{
    method: 'POST',
     headers: {'Content-Type': 'application/json' },
    body:JSON.stringify(data)
  })
  .then(res => res.json())
  .then(data => {
    if(data.result === true){
        const toaster = document.getElementById('toaster');
        const tosterbody = document.getElementById('tosterbody');
        toaster.classList.remove('hide');
        toaster.classList.add('show','text-bg-success');
        tosterbody.innerText = data.message;               
        setTimeout(() => {
          toaster.classList.remove('show','text-bg-success');
          toaster.classList.add('hide');
        }, 2000);
      }else{
        const toaster = document.getElementById('toaster');
        const tosterbody = document.getElementById('tosterbody');
        toaster.classList.remove('hide');
        toaster.classList.add('show','text-bg-danger');
        tosterbody.innerText = data.message; 
        setTimeout(() => {
          toaster.classList.remove('show','text-bg-danger');
          toaster.classList.add('hide');
        }, 2000);
    }
  })
  .catch(err => {
    console.error('error addingwishlist:',err);
  })
}


function zoom(e){
let zoomer = e.currentTarget;
e.offsetX ? offsetX = e.offsetX :
offsetx = e.touches[0].pageX
e.offsetY ? offsetY = e.offsetY :
offsetx = e.touches[0].pageX
x = offsetX/zoomer.offsetWidth*150
y = offsetY/zoomer.offsetHeight*150
zoomer.style.backgroundPosition = x + '% ' + y + '%';

}


