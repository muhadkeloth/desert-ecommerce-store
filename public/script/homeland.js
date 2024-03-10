
function goToHome(){
  window.location.href = '/';
};

function productlist(){
  window.location.href = '/productlist';
}

function categoryproducts(category){
  window.location.href = `/productlist?gender=${category}`;
}


function profilemenu(){
  const dropdown_content = document.getElementById('toggle_dropdown');
  if(dropdown_content.style.display === 'block'){
    dropdown_content.style.display = 'none';
  }else{
    dropdown_content.style.display = 'block';
  }
}


// for productdetaisl page productlist 
function productdetails(productId){
  window.location.href = `/productdetails?productId=${productId}`;
}

function goToCart(){
  window.location.href = '/cart';
}

function goToWishlist(){
  window.location.href = '/wishlist';
}


function search(){
  const searchInput = document.getElementById('search-input').value;
  if(searchInput){
    window.location.href = `/productlist?search=${searchInput}`;
  }else{
    return;
  }
}