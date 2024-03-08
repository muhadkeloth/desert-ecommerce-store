




function goToLogout(){
    const form = document.createElement('form');

    form.method = 'POST';
    form.action = '/admin/logout';
    document.body.appendChild(form);

    form.submit();
}

function goToHome(){
    window.location.href = '/admin';
}

function goToCategory(){
    window.location.href = '/admin/category' ;
}

function goToProducts(){
    window.location.href = '/admin/products' ;
}

function goToUsers(){
    window.location.href = '/admin/users' ;
}

function goToOffers(){
    window.location.href = '/admin/offers' ;
}

function goToCoupons(){
    window.location.href = '/admin/coupons' ;
}

function goToOrders(){
    window.location.href = '/admin/orders' ;
}

function goToBanners(){
    window.location.href = '/admin/banners' ;
}

function goToSalesReport(){
    window.location.href = '/admin/salesreport' ;
}


// function searches(){
//     const value = document.getElementById('search');
//     let isValid =true;
//     if(!value){
//         isValid = false;
//     }
//     return isValid;
// }









