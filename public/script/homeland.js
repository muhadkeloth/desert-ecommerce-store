
function goToHome(){
  window.location.href = '/';
};

function productlist(){
  window.location.href = '/productlist';
}

function categoryproducts(category){
  window.location.href = `/productlist?gender=${category}`;
}

// const carousel = document.querySelector('.carousel');
// const images = carousel.querySelectorAll('.carousel-item img');

// function setImgHeights() {
//   const carouselHeight = carousel.offsetHeight;
//   images.forEach(img => img.style.height = `${carouselHeight}px`);
// }


function profilemenu(){
  const dropdown_content = document.getElementById('toggle_dropdown');
  if(dropdown_content.style.display === 'block'){
    dropdown_content.style.display = 'none';
  }else{
    dropdown_content.style.display = 'block';
  }
}

// productpage
// let selectedColors = [];

// function applyFilter() {
//   const selectedColorElements = document.querySelectorAll('input[name="color"]:checked');

//   if (selectedColorElements.length > 4) {
//     alert('Please select up to 4 colors.');
//     return;
//   }

//   selectedColors = Array.from(selectedColorElements).map(colorElement => colorElement.value);
//   updateSelectedColors();
// }

// function updateSelectedColors() {
//   const selectedColorsContainer = document.getElementById('selectedColors');
//   selectedColorsContainer.innerHTML = '';

//   selectedColors.forEach(color => {
//     const colorDiv = document.createElement('div');
//     colorDiv.style.backgroundColor = color;
//     colorDiv.className = 'selected-color';
//     selectedColorsContainer.appendChild(colorDiv);
//   });
// }


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