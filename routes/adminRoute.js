const express = require('express');
const adminRoute = express();

const adminController = require('../controller/adminController');
const auth = require('../middlewares/Auth')

adminRoute.set('view engine','ejs');
adminRoute.set('views','./views/admin');

adminRoute.get('/login',adminController.loginland);
adminRoute.post('/login',adminController.loginpost);

// Admin dash 
adminRoute.get('/',auth.adminLogin,adminController.dashboardland);
adminRoute.get('/dashChart',auth.adminLogin,adminController.dashChart);

// category manage
adminRoute.get('/category',auth.adminLogin,adminController.categoryland)
adminRoute.patch('/category/categorytoggle/:categoryId',auth.adminLogin,adminController.updateCategorySatatus)
adminRoute.delete('/category/deleteCategory',auth.adminLogin,adminController.deleteCategory)
adminRoute.put('/category/updateCategory',auth.adminLogin,adminController.editCategoryName)
adminRoute.post('/category/createCategory',auth.adminLogin,adminController.createCategory)

// product manage
adminRoute.get('/products',auth.adminLogin,adminController.productsland)
adminRoute.patch('/products/producttoggle/:productId',auth.adminLogin,adminController.updateproductSatatus)
adminRoute.delete('/products/deleteProduct',auth.adminLogin,adminController.deleteProduct)
adminRoute.get('/products/editProduct/:productId',auth.adminLogin,adminController.editProduct)
adminRoute.post('/products/editProduct',auth.adminLogin,adminController.uploaded,adminController.editProductpost)
adminRoute.get('/products/createProduct',auth.adminLogin,adminController.createProduct)
adminRoute.post('/products/createProduct',auth.adminLogin,adminController.uploaded,adminController.createProductPost)

// users management
adminRoute.get('/users',auth.adminLogin,adminController.usersland)
adminRoute.patch('/users/usertoggle/:userId',auth.adminLogin,adminController.updateUserSatatus)

// orders
adminRoute.get('/orders',auth.adminLogin,adminController.ordersland)
adminRoute.post('/ordercancel',auth.adminLogin,adminController.ordercancel)
adminRoute.post('/ordertoggle',auth.adminLogin,adminController.ordertoggle)

// coupons
adminRoute.get('/coupons',auth.adminLogin,adminController.couponsland);
adminRoute.post('/coupons',auth.adminLogin,adminController.couponspost);
adminRoute.patch('/coupons/coupontoggle/:couponId',auth.adminLogin,adminController.updateCouponSatatus)
adminRoute.delete('/coupons/deletecoupon',auth.adminLogin,adminController.deletecoupon)

// offers
adminRoute.get('/offers',auth.adminLogin,adminController.offersland)
adminRoute.post('/offers',auth.adminLogin,adminController.offerspost)
adminRoute.get('/offers/findcategory',auth.adminLogin,adminController.fetchcategory)
adminRoute.get('/offers/findproducts/:categoryId/products',auth.adminLogin,adminController.fetchprodcuts)
adminRoute.patch('/offers/offertoggle/:offerId',auth.adminLogin,adminController.updateOfferSatatus)
adminRoute.delete('/offers/deleteoffer',auth.adminLogin,adminController.deleteoffer)


// salesroposrt
adminRoute.get('/salesreport',auth.adminLogin,adminController.salesreportland)
adminRoute.post('/generatePdfSalesReport',auth.adminLogin,adminController.generatePdfSalesReport)
adminRoute.post('/generateExcelSalesReport',auth.adminLogin,adminController.generateExcelSalesReport)

// logout
adminRoute.post('/logout',adminController.logoutpost)

module.exports = adminRoute;