
const sizeSelect = document.getElementById('sizeSelect');
let stockdetails = document.getElementById('stockdetails').value;
const parsedStockDetails = JSON.parse(stockdetails);
for (let size in parsedStockDetails) {
  if (parsedStockDetails.hasOwnProperty(size)) {
    let option = document.createElement('option');
    option.value = size.replace('size', ''); 
    option.text = option.value;

    if (parsedStockDetails[size] > 0) {
      sizeSelect.appendChild(option);
    } else {
      option.disabled = true; 
      option.style.opacity = 0.5; 
      option.text += ' - Out of Stock';
      option.classList.add('text-danger');
      sizeSelect.appendChild(option);
    }
  }
}


// img sub in to main image
function changeMainImg(imagesrc) {
  const mainImage = document.getElementById("mainImage");
  const zoomimg = document.getElementById("zoomimg");
  mainImage.src = "/assets/uploads/" + imagesrc;
  zoomimg.style.backgroundImage = 'url("/assets/uploads/' + imagesrc + '")';
}
// increment and decrement quantity of product
function incrementqty() {
  const qtyInput = document.getElementById("qty");
  let currentqty = parseInt(qtyInput.value);
  if (currentqty < 5) {
    qtyInput.value = ++currentqty;
  }
}
function decrementqty() {
  const qtyInput = document.getElementById("qty");
  let currentqty = parseInt(qtyInput.value);
  if (currentqty > 1) {
    qtyInput.value = --currentqty;
  }
}



function goBack() {
window.history.back();
}

function addtocart(productId,userid) {
  if(userid === 'false'){
     window.location.href = '/login';
  }else{
    const size = document.getElementById("sizeSelect").value;
    const qty = document.getElementById("qty").value;
    const data = {
      size: size,
      qty: qty,
    };
    fetch("/addtocart?productId=" + productId, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.result === true) {
          const toaster = document.getElementById("toaster");
          const tosterbody = document.getElementById("tosterbody");
          toaster.classList.remove("hide");
          toaster.classList.add("show", "text-bg-success");
          tosterbody.innerText = data.message;
          setTimeout(() => {
            toaster.classList.remove("show", "text-bg-success");
            toaster.classList.add("hide");
          }, 2000);
          cartcount();
        } else {
          const toaster = document.getElementById("toaster");
          const tosterbody = document.getElementById("tosterbody");
          toaster.classList.remove("hide");
          toaster.classList.add("show", "text-bg-danger");
          tosterbody.innerText = data.message;
          setTimeout(() => {
            toaster.classList.remove("show", "text-bg-danger");
            toaster.classList.add("hide");
          }, 2000);
        }
      })
      .catch((err) => {
        console.error("error addingcart:", err);
      });
  }
}

function addtowishlist(productId,userid){
  if(userid === 'false'){
    window.location.href = '/login';
 }else{
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
        wishlistcount();
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


function cartcount(){
  fetch('/cartcount')
 .then(res => res.json())
 .then(data =>{ 
  if(data.success === true){
    const count = document.getElementById('cartCount');
    count.innerText = data.count;
  }
})
.catch(err => {
  console.error('error fetch counter wishlist',err);
})
}
function wishlistcount(){
  fetch('/wishlistcount')
 .then(res => res.json())
 .then(data =>{ 
  if(data.success === true){
    const count = document.getElementById('wishlistCount');
    count.innerText = data.count;
  }
})
.catch(err => {
  console.error('error fetch counter cart',err);
})
}