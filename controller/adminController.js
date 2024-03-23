const Users = require('../models/userModel');
const categorys = require('../models/categoryModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const Offer = require('../models/offerModel');
const products = require('../models/productModel');
const mongoose =require('mongoose');
const fs = require('fs');
const multer = require('multer')
const path = require('path');
const PDFDocument = require('../pdfkit-tables.js');
const ExcelJS = require('exceljs');
const { AsyncLocalStorage } = require('async_hooks');

const storage = multer.diskStorage({
  destination:(req,file,cb) => {
    cb(null,'./public/assets/uploads')
  },
  filename:(req,file,cb) => {
    cb(null,file.originalname+"-"+Date.now()+path.extname(file.originalname))
  }
});   

const upload = multer({storage:storage});

let sidebarpointer;


const loginland = (req,res) => {
    if(!req.session?.admin){
      res.render('login',{title:"login Admin"});
    }else{
      res.redirect('/admin');
    }
}

       
const loginpost = async (req, res) => {
  const { email, password } = req.body;
    if (email === process.env.ADMIN_ID && password === process.env.ADMIN_PASS) {
   req.session.admin = 'adminValid';
   res.redirect('/admin');
    
  } else {
    return res.render("login", {
      title:"login Admin",
      message: "emailError",
      error: {
        message: "email and password Invalid",
      },
    });
  }
};


const dashboardland = async (req,res) => {
  try{
    const report = {};
    report.totalOrders = await Order.countDocuments({ status: { $nin: ['Cancelled', 'Returned'] } });
    const totalsalesConfirmed = await Order.aggregate([
      {
          $match: { status: { $in: ['Delivered'] } }
      },
      {
          $group: {
              _id: null,
              totalPrice: { $sum: { $toInt: '$totalPrice' } }
          }
      }
  ])
  report.activeUsers = await Users.countDocuments({ blockStatus: true });
  report.totalsales = totalsalesConfirmed.length > 0 ? totalsalesConfirmed[0].totalPrice : 0;
  report.totalProdcuts = await products.countDocuments({ Status: true });
  const topOrderCategory = await Order.aggregate([
    {
      $match: { status: 'Delivered' }
    },
    {
      $unwind: "$item"
    },
    {
      $lookup: {
        from: "products",
        localField: "item.productId",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      $unwind: "$product"
    },
    {
      $lookup: {
        from: "categorys",
        localField: "product.category",
        foreignField: "_id",
        as: "category"
      }
    },
    {
      $unwind: "$category"
    },
    {
      $group: {
        _id: "$category.categoryName",
        totalOrders: { $sum: 1 }
      }
    },
    {
      $sort: { totalOrders: -1}
    }
  ])

  const topOrderproduct = await Order.aggregate([
    { $unwind: "$item" },
    { $group: {
        _id: "$item.productId",
        totalQuantity: { $sum: "$item.quantity" }
    }},
    { $sort: { totalQuantity: -1 } },
    { $limit: 3 },
    { $lookup: {
        from: "products", 
        localField: "_id",
        foreignField: "_id",
        as: "productDetails"
    }},
    { $project: {
        _id: 0,
        productId: "$_id",
        totalQuantity: 1,
        title: { $arrayElemAt: ["$productDetails.title", 0] },
        brand: { $arrayElemAt: ["$productDetails.brand", 0] }
    }}
]);
const brandSet = new Set();
topOrderproduct.forEach(product => {
    brandSet.add(product.brand);
});

const brand = Array.from(brandSet);
    res.render('dash',{report, topOrderCategory,brand, topOrderproduct, sidebarpointer : 'dash Admin'})
  }catch(err){
    console.error('error in dashbord admin side:',err);
  }
}


const dashChart = async (req,res) => {
  try{
    let filter = req.query.filter;
    let startDate = new Date();
    let endDate = new Date();
    let format;
    if(filter === 'daily'){
      startDate.setDate(startDate.getDate() - 6);
      format = '%d';
    }else{
      startDate.setMonth(startDate.getMonth() - 5);
      format = '%m';
      filter = 'month';
    }
    const combinedData = [];
    if(filter){       
      const salesData = await Order.aggregate([
        {
          $match: {
            status: 'Delivered',
            orderDate: { $gte: startDate, $lte: endDate}
          }
        },
        {
          $group: {
            _id: {$dateToString: { format: format, date: '$orderDate'}},
            salesCount: {$sum:1}
          }
        },
        { $sort: {_id: 1}}
      ]);
      
      if(filter === 'daily'){
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; 
        const lastSevenDays = [];
        for (let i = 6; i >= 0; i--) {
          const currentDate = new Date()
          currentDate.setDate(currentDate.getDate() -i);
          const dayIndex = currentDate.getDay();
          const dayName = days[dayIndex];  

          const dayObject = {};
          dayObject[dayName] = currentDate.getDate();
          lastSevenDays.push(dayObject);
        }
        for (const item of lastSevenDays) {
          const dayName = Object.keys(item)[0];
          const dataItem = salesData.find((dataItem) => {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() -parseInt(dataItem._id));
            const dayIndex = currentDate.getDay();
            const dayNameinG = days[dayIndex];
            return dayNameinG === dayName;
          }); 
          if (dataItem) {
                combinedData.push({
                date: dayName, 
                salesCount: dataItem.salesCount
              });            
          } else {
            combinedData.push({
              date: dayName, 
              salesCount: 0
            });
          }
        }
        return res.json({result:true,combinedData})
      }else{
        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
      ];
      const lastSixMonth = [];
      for (let i = 5; i>=0 ; i--){
        const currentMonth = new Date();
        currentMonth.setMonth(currentMonth.getMonth() -i);
        const monthIndex = currentMonth.getMonth();
        const monthName = months[monthIndex];

        const monthObject = {};
        monthObject[monthName] = currentMonth.getMonth() +1;
        lastSixMonth.push(monthObject);
      }
      for(const item of lastSixMonth){
        const monthName = Object.keys(item)[0];
        const dataItem = salesData.find((dataItem) => {
          return item[monthName] === parseInt(dataItem._id)
        })
        if(dataItem){
          combinedData.push({
            date: monthName,
            salesCount: dataItem.salesCount
          });
        }else{
          combinedData.push({
            date: monthName,
            salesCount: 0
          })
        }
      }
      }
    }

      const doughnut = await Order.aggregate([
        { $match: { status: "Delivered"}},
        { $unwind: "$item" },
        { $lookup: { from: "products",localField: "item.productId",foreignField: "_id",as: "product"}},
        { $unwind: "$product"},
        { $lookup: { from: "categorys", localField: "product.category",foreignField: "_id",as: "category"}},
        { $unwind: "$category"},
        { $group : { _id: "$category.categoryName", numberOfOrders: { $sum: 1 }}}
      ]);
      res.json({result:true,doughnut,combinedData})
   
  }catch(err){
    console.error('error in fetch in chart',err);
    res.status(500).json({message: "Internal server error"});
  }
}



const categoryland = async (req,res) => {
  let search = 0;
  if(req.params.search && req.params.search !== '0') search = req.params.search;
  else if( req.query.search && req.query.search !== '0') search = req.query.search; 
  const perPage  = 12;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * perPage;
  sidebarpointer = 'catagory Admin';
    try{
      if(!search){
        const allCategory = await categorys.find().skip(skip).limit(perPage);
        const totalcategory = await categorys.countDocuments();
        const totalPages = Math.ceil(totalcategory /perPage);
        res.render('category',{allCategory, totalPages, currentPage: page, search , sidebarpointer });
      }
      if(search){
        const categoryName = new RegExp(search, 'i');
        const allCategory = await categorys.find({categoryName:categoryName}).skip(skip).limit(perPage);
        const totalCount = await categorys.countDocuments({categoryName:categoryName});
        const totalPages = Math.ceil(totalCount /perPage);
        res.render('category',{allCategory, totalPages, currentPage: page ,search, sidebarpointer});
      }
    }
    catch(err){
      console.error('error fetching category',err);
    } 
}

const updateCategorySatatus = async (req,res) => {
  const categoryId = req.params.categoryId; 
  try{
    const categorydoc = await categorys.findById(categoryId);
    if(!categorydoc){
      return res.status(404).json({error:'category not found'})
    }
    categorydoc.Status =!categorydoc.Status;
    const updatedCategory = await categorydoc.save();
    res.json(updatedCategory);
  }
  catch(err){
    console.error('error updating category status:',err);
    res.status(500).json({error:'internal server error'})
  }
}

const editCategoryName = async (req,res) => {
  const {categoryId, categoryName} = req.body;
  try{
    const uniqueCategory = categoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
    const existingchecking = await categorys.find({categoryName:uniqueCategory});
    if(Object.keys(existingchecking).length > 0) { 
      res.json({result:'notUnique',message:'error edit category'})
    }else{
      await categorys.findByIdAndUpdate(categoryId,{categoryName:categoryName},{new:true});
      res.json({result:true,message:'category successfully updated'});
    }
  }catch(err){
    console.error('error updating in backend');
  } 
}

const createCategory = async (req,res) =>{
  const newCategory = req.body.createcategory;
  try{
    const uniqueCategory = await categorys.findOne({categoryName:newCategory});
    if(!uniqueCategory?.categoryName){
      const created = new categorys({categoryName:newCategory});
      const savedUser = await created.save();
      if(savedUser){
        res.json({result:true,message:'category created new'});
      }
    }else{
      res.json({result:"notUnique",message:'error creat category'})
    }
  }catch(err){
      console.error('error on createCategory',err);
  }
 
}

const deleteCategory = async (req,res) => {
  const categoryId = req.body.categoryId;
  try{
    const deletedCategory = await categorys.findByIdAndDelete(categoryId);
    if(Object.keys(deletedCategory).length > 0) res.json({success:true,message:'Category delete successfuly'});
    else res.status(400).json({success:false,message:'Category delete failed'});
  }catch(err){
    console.error('error deletecategory in backend');
  }
}



const productsland = async (req,res) => {
    let search = 0;
    if(req.params.search && req.params.search !== '0') search = req.params.search;
    else if( req.query.search && req.query.search !== '0') search = req.query.search; 
    let message = req.query.message || false;
    if(message == 'editsuccess'){
      message = {
        bg:'text-bg-success',
        innertext:'product edited successfully'
      }
    }else if(message == 'createsuccess'){
      message = {
        bg:'text-bg-success',
        innertext:'product created successfully'
      }
    }else if(message == 'editfailed'){
      message = {
        bg:'text-bg-danger',
        innertext:'product edit failed'
      }
    }
    const perPage  = 12;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * perPage;
    sidebarpointer = 'products Admin';
    let query = [
      {
        $lookup: {
          from:"categorys",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },{
        $unwind:"$category"
      },{
        $sort: { _id:-1}
      },{
        $skip:skip
      },{
        $limit: perPage
      }
    ]

    try{
      if(!search){
        const allProducts = await products.aggregate(query);
        const totalproducts = await products.countDocuments();
        const totalPages = Math.ceil(totalproducts /perPage);
        res.render('products',{allProducts, totalPages, currentPage: page, search , sidebarpointer,message });
      }
      if(search){
        const productName = new RegExp(search, 'i');
        const allProducts = await products.find({title:productName}).skip(skip).limit(perPage);
        const totalCount = await products.countDocuments({title:productName});
        const totalPages = Math.ceil(totalCount /perPage);
        res.render('products',{allProducts, totalPages, currentPage: page ,search, sidebarpointer, message });
      }
    }
    catch(err){
      console.error('error fetching products backend',err);
    }
}

const updateproductSatatus = async (req,res) => {
  const productId = req.params.productId; 
  try{
    const productdoc = await products.findById(productId);
    if(!productdoc){
      return res.status(404).json({error:'User not found'})
    }
    productdoc.Status =!productdoc.Status;
    const updatedProduct = await productdoc.save();
    res.json(updatedProduct);
  }
  catch(err){
    console.error('error updating product status:',err);
    res.status(500).json({error:'internal server error'})
  }
}

const editProduct = async (req,res) => {

  const productId = req.params.productId;
  const sidebarpointer = 'products Admin';
  try{
    if(productId){
      const productid = new mongoose.Types.ObjectId(productId);
      const productdata = await products.aggregate([
        {
          $lookup:{
            from:"categorys",
            localField: "category",
            foreignField: "_id",
            as: "category"
          }
        },{
          $unwind: "$category"
        },{
          $match:{
            _id: productid
          }
        }
      ]);
      const category = await categorys.find({ Status: true });
    res.render('product-edit',{sidebarpointer,category,productdata})
    }
  }catch(err){
    console.error('error on render updateproduct page',err);
  }
}

const uploaded = (req,res,next)=>{
  upload.array('imageUpload',5)(req,res,(err) => {
    if(err instanceof multer.MulterError){
      return res.status(400).json({
        success:false,
        message:'Multer error: ' + err.message
      })
    }
    next() 
  })
}


const editProductpost = async (req,res) => {
  const formData = req.body;
  let updatedProduct ;
  const images = req.files.map(file => file.filename);
  try{
    if(images.length === 0){
      updatedProduct = await products.findByIdAndUpdate(formData.id,
        {
          $set:{
            title:formData.title,
            subtitle: formData.subtitle,
            description: formData.description,
            brand: formData.brand,
            price:{
              CurrentPrice: formData.offerprice,
              OriginalPrice: formData.mrp,        
            },
              colors: formData.colors,
              category: formData.category,
              stocks:{
                Size40: formData.stock.Size40,
                Size41: formData.stock.Size41,
                Size42: formData.stock.Size42,
                Size43: formData.stock.Size43,
                Size44: formData.stock.Size44
              }
          }
          
        },{new: true})
    }else{
      updatedProduct = await products.findByIdAndUpdate(formData.id,
        {
          $set:{
            title:formData.title,
            subtitle: formData.subtitle,
            description: formData.description,
            brand: formData.brand,
            price:{
              CurrentPrice: formData.offerprice,
              OriginalPrice: formData.mrp,        
            },
              colors: formData.colors,
              category: formData.category,
              stocks:{
                Size40: formData.stock.Size40,
                Size41: formData.stock.Size41,
                Size42: formData.stock.Size42,
                Size43: formData.stock.Size43,
                Size44: formData.stock.Size44
              },
              images: images
          }
          
        },{new: true})
    }
    if(updatedProduct){
      res.redirect('/admin/products?message=editsuccess')
    }else{
      res.redirect('/admin/products?message=editfailed')
     
    }

  }catch(err){
    console.error('create or edit error producta',err);
  }
}

const createProduct = async (req,res) => {
  const category = await categorys.find({Status:true});
  res.render('product-create',{sidebarpointer:'products Admin',category})
}

const createProductPost = async (req,res) => {
    const formData = req.body;
    const images = req.files.map(file => file.filename);
    try{
      const product = new products({
        title:formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        brand: formData.brand,
        price:{
          CurrentPrice: formData.offerprice,
          OriginalPrice: formData.mrp,        
        },
          colors: formData.colors,
          category: formData.category,
          stocks:{
            Size40: formData.stock.size40,
            Size41: formData.stock.size41,
            Size42: formData.stock.size42,
            Size43: formData.stock.size43,
            Size44: formData.stock.size44
          },        
          images: images
      })
      const saveproduct = await product.save()
      if(saveproduct){
        const category = await categorys.find({Status:true});
        res.redirect('/admin/products?message=createsuccess')
      }else{
        const category = await categorys.find({Status:true});
        res.render('product-create',{sidebarpointer:'products Admin',category})
      }  
    }catch(err){
      console.error('create or edit error producta',err);
    }
}


const deleteProduct = async (req,res) => {
  const productId = req.body.productId;
  try{
    const deletedProduct = await products.findByIdAndDelete(productId);
    if(Object.keys(deletedProduct).length > 0) {
      deletedProduct.images.forEach(fileName => {
        const filePath = `./public/assets/uploads/${fileName}`;
        fs.unlinkSync(filePath);
      })   
      res.json({success:true,message:'Product delete successfuly'});
    } else{
      res.status(404).json({success:false,message:'product not found'})
    } 
  }catch(err){
    console.error('error deleteProduct in backend');
  }
}


const usersland = async (req,res) => {
    let search = 0;
      if(req.params.search  && req.params.search !== '0' ) search = req.params.search;
      else if( req.query.search && req.query.search !== '0') search = req.query.search;   
    const perPage  = 12;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * perPage;
    const sidebarpointer = 'users Admin';
    try{
      if(!search){
        const allusers = await Users.find().skip(skip).limit(perPage);
        const totalUsers = await Users.countDocuments();
        const totalPages = Math.ceil(totalUsers /perPage);
        res.render('users',{allusers, totalPages, currentPage: page, search , sidebarpointer});
      }
      if(search){
        const userName = new RegExp(search, 'i');
        const allusers = await Users.find({userName:userName}).skip(skip).limit(perPage);
        const totalCount = await Users.countDocuments({userName:userName});
        const totalPages = Math.ceil(totalCount /perPage);
        res.render('users',{allusers, totalPages, currentPage: page ,search, sidebarpointer});
      }
    }
    catch(err){
      console.error('error fetching users',err);
    } 
}

const updateUserSatatus = async (req,res) => {
  const userId = req.params.userId;  
  try{
    const user = await Users.findById(userId);
    if(!user){
      return res.status(404).json({error:'User not found'})
    }
    user.blockStatus =!user.blockStatus;
    const updatedUser = await user.save();
    res.json(updatedUser);
  }
  catch(err){
    console.error('error updating user status:',err);
    res.status(500).json({error:'internal server error'})
  }

}


const ordersland = async (req,res) => {
  let search = 0;
      if(req.params.search  && req.params.search !== '0' ) search = req.params.search;
      else if( req.query.search && req.query.search !== '0') search = req.query.search; 
  const page = parseInt(req.query.page,10) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;
  try{
    const totalorder =await Order.countDocuments();
    const totalPages = Math.ceil(totalorder /limit);
    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "item.productId",
          foreignField: "_id",
          as: "itemDetails" 
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails" 
        }
      },
      {
        $addFields: {
          "item.productName": { $arrayElemAt: ["$itemDetails.title", 0] },
          "userEmail": { $arrayElemAt: ["$userDetails.email", 0] } 
        }
      },
      {
        $project: {
          "itemDetails": 0, 
          "userDetails": 0 
        }
      }
    ]).sort({_id:-1}).skip(skip).limit(limit);
    res.render('orders',{sidebarpointer:'orders Admin',orders,totalPages,page,search});
  }catch(err){
    console.error('error in admin order',err);
  }  
}


const ordercancel =async (req,res) => {
  const orderId = req.body.orderId;
  const userId = req.session.user;
  try{
    const orderdoc = await Order.findById(orderId);
    
    if(orderdoc.status !== 'Placed'){
      for (const item of orderdoc.item){
        const productId =item.productId;
        const size = item.size;
        const quantity = item.quantity;
        await products.findByIdAndUpdate(productId,{
          $inc:{[`stocks.${size}`] : quantity}
        })
      }
    }

    const updated = await Order.findByIdAndUpdate(orderId,{
      status:'Cancelled'
    },{new:true});

    if(updated){
      const user = await Users.findById(userId);
      if(orderdoc.paymentType === 'RAZORPAY'){
        let walletAmount = orderdoc.totalPrice;
        const date = new Date();
        user.wallethistory.push({orderId,date,amount:walletAmount});
        user.wallet += walletAmount;
        await user.save();
    }else if (user?.wallethistory?.length > 0) {
              const walletHistoryEntry = user.wallethistory.find(entry => entry.orderId.toString() === orderId.toString());
              if (walletHistoryEntry) {
                  let walletAmount = Math.abs(walletHistoryEntry.amount);
                  const date = new Date();
                  user.wallethistory.push({orderId,date,amount:walletAmount});
                  user.wallet += walletAmount;
                  await user.save();
              }
          }
      res.status(200).json({success:true});
    }
  }catch(err){
    console.error('error in ordercancel',err);
  }
}


const ordertoggle = async (req,res) =>{
  const orderId = req.body.orderId;
  let toggleStatus ='';
  try{
    const orderdetails = await Order.findById(orderId);
    if(orderdetails.status === 'Cancelled'){
      return res.json({result:'already Cancelled'})
    }else if(orderdetails.status === 'Placed'){
      for (const item of orderdetails.item){
        const productId =item.productId;
        const size = item.size;
        const quantity = item.quantity;
        await products.findByIdAndUpdate(productId,{
          $inc:{[`stocks.${size}`] : -quantity}
        })
      }
      toggleStatus = 'Confirmed';
    }else if(orderdetails.status === 'Confirmed'){
      toggleStatus = 'Delivered';
    }else if(orderdetails.status === 'Delivered'){
      return res.json({result:'already Delivered'})
    }
    orderdetails.status = toggleStatus;
    const result = await orderdetails.save();
    if(result){
      res.status(200).json({success:true})
    }
  }catch(err){
    console.error('error in ordercancel',err);
  }
}



const couponsland = async (req,res) => {
  let search ;
  if (req.params.search && req.params.search !== '0') {
    search = req.params.search;
  } else if (req.query.search && req.query.search !== '0') {
    search = req.query.search;
  }
  let message = req.query.message;
  if(message === 'notunique'){
    message = {bg:'text-bg-danger',innertext:'failed:coupon code already exist'}
  }else if(message === 'created'){
    message = {bg:'text-bg-success',innertext:`success:   coupon code created seccessfully`}
  }
  const perPage = 12;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * perPage;
  try{
    if(!search){
      const allCoupons = await Coupon.find().skip(skip).limit(perPage);
      const totalcoupons = await Coupon.countDocuments();
      const totalPages = Math.ceil(totalcoupons /perPage);
      res.render('coupons',{allCoupons, totalPages,  page, search , sidebarpointer:'coupons Admin' ,message });
    }
    if(search){
      const couponsName = new RegExp(search, 'i');
      const allCoupons = await Coupon.find({title:couponsName}).skip(skip).limit(perPage);
      const totalCount = await Coupon.countDocuments({title:couponsName});
      const totalPages = Math.ceil(totalCount /perPage);
      res.render('coupons',{allCoupons, totalPages,  page ,search, sidebarpointer:'coupons Admin',message});
    }
  }catch(err){
    console.error('error in coupons land',err);
  }
}


const couponspost = async (req,res) => {
  const {title, couponcode, percentage,minPurchase,maxAmount, startdate, expdate} = req.body;
  try{
    const isunique = await Coupon.findOne({couponCode:couponcode});
    if(isunique){
      res.redirect('/admin/coupons?message=notunique')
    }else{
      const newcoupon = new Coupon({
        title,
        couponCode:couponcode,
        percentage,
        minCartValue:minPurchase,
        maxDiscount:maxAmount,
        startDate:startdate,
        expDate:expdate
      })
      await newcoupon.save();
      res.redirect('/admin/coupons?message=created')
    }
  }catch(err){
    console.error('error in create coupon',err);
  }
}


const updateCouponSatatus = async (req,res) => {
  const couponId = req.params.couponId; 
  try{
    const coupondoc = await Coupon.findById(couponId);
    if(!coupondoc){
      return res.status(404).json({error:'coupon not found'})
    }
    coupondoc.status =!coupondoc.status;
    const updatedcoupon = await coupondoc.save();
    res.json(updatedcoupon);
  }
  catch(err){
    console.error('error updating coupon status:',err);
    res.status(500).json({error:'internal server error'})
  }
}


const deletecoupon = async (req,res) => {
  const couponId = req.body.couponId;
  try{
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);
    if(Object.keys(deletedCoupon).length > 0) res.json({success:true,message:'coupon delete successfuly'});
    else res.status(400).json({success:false,message:'coupon delete failed'});
  }catch(err){
    console.error('error deletecoupon in backend');
  }
}


const offersland = async (req,res) => {
  let search ;
  if (req.params.search && req.params.search !== '0') {
    search = req.params.search;
  } else if (req.query.search && req.query.search !== '0') {
    search = req.query.search;
  }
  let message = req.query.message;
  if(message === 'notunique'){
    message = {bg:'text-bg-danger',innertext:'failed: offer already exist'}
  }else if(message === 'created'){
    message = {bg:'text-bg-success',innertext:`success:   offer created seccessfully`}
  }
  const perPage = 12;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * perPage;
  try{
    if(!search){
      const allOffer = await Offer.find().skip(skip).limit(perPage).populate('category', 'categoryName').populate('products','title');
      const totaloffers = await Offer.countDocuments();
      const totalPages = Math.ceil(totaloffers /perPage);
      res.render('offer',{allOffer, totalPages,  page, search , sidebarpointer:'offers Admin' ,message });
    }
    if(search){
      const offerName = new RegExp(search, 'i');
      const allOffer = await Offer.find({name:offerName}).skip(skip).limit(perPage);
      const totalCount = await Offer.countDocuments({name:offerName});
      const totalPages = Math.ceil(totalCount /perPage);
      res.render('offer',{allOffer, totalPages,  page ,search, sidebarpointer:'offers Admin',message});
    }
  }catch(err){
    console.error('error in offers land',err);
  }
}


const fetchcategory = async (req,res) => {
  try{
    const categories = await categorys.find({Status:true});
    res.json(categories);
  }catch(err){
    console.error('error in fetch category in create offer ',err);
    res.status(500).json({message:err.message})
  }
}


const fetchprodcuts = async (req,res) => {
  const categoryId = req.params.categoryId;
  try{
    const offers = await Offer.find({category:categoryId});
    const productIdsInOffers = offers.flatMap(offer => offer.products);
    const productslist = await products.find({category:categoryId,Status:true,_id:{$nin:productIdsInOffers}});
    res.json(productslist);
  }catch(err){
    res.status(500).json({message:err.message});
  }
}


const offerspost = async (req,res) => {
  const {title, percentage,categorySelect,productSelect  } = req.body;
  try{
      const newoffer = new Offer({
        name:title,
        category:categorySelect,
        percentage,
        products:productSelect
      })
      await newoffer.save();
      const productsdoc = await products.find({ _id: { $in: productSelect } });
      await Promise.all(productsdoc.map(async (product) => {
        product.price.offer = percentage;
        await product.save();
      }));

      res.redirect('/admin/offers?message=created')
    
  }catch(err){
    res.redirect('/admin/offers?message=notunique')
  }
}


const updateOfferSatatus = async (req,res) => {
  const offerId = req.params.offerId; 
  try{
    const offerdoc = await Offer.findById(offerId);
    if(!offerdoc){
      return res.status(404).json({error:'offer not found'})
    }
    if(!offerdoc.status){
      const productsdoc = await products.find({ _id: { $in: offerdoc.products } });
      await Promise.all(productsdoc.map(async (product) => {
        product.price.offer = offerdoc.percentage;
        await product.save();
      }));
    }else{
      const productsdoc = await products.find({ _id: { $in: offerdoc.products } });
      await Promise.all(productsdoc.map(async (product) => {
         product.price.offer = '' ;        
        await product.save();
      }));
    }
    offerdoc.status =!offerdoc.status;
    const updatedoffer = await offerdoc.save();
    res.json(updatedoffer);
  }
  catch(err){
    console.error('error updating offer status:',err);
    res.status(500).json({error:'internal server error'})
  }
}


const deleteoffer = async (req,res) => {
  const offerId = req.body.offerId;
  try{
    const deletedoffer = await Offer.findByIdAndDelete(offerId);
    const productsdoc = await products.find({ _id: { $in: deletedoffer.products } });
      await Promise.all(productsdoc.map(async (product) => {
        product.price.offer = '';
        await product.save();
      }));
    if(Object.keys(deletedoffer).length > 0) res.json({success:true,message:'offer delete successfuly'});
    else res.staus(400).json({success:false,message:'offer delete failed'});
  }catch(err){
    console.error('error deleteoffer in backend',err.message);
  }
}


const salesreportland = async (req,res) => {
  try{
    const perPage = 12;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * perPage;

    let startDate, endDate;
    const filter = req.query.filter;

        switch (filter) {
            case 'weekly':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                endDate = new Date();
                break;
            case 'monthly':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                startDate.setDate(1); 
                endDate = new Date();
                break;
            case 'yearly':
                startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1);
                startDate.setMonth(0); 
                startDate.setDate(1); 
                endDate = new Date();
                break;
            case 'custom':
                startDate = req.query.startDate ? new Date(req.query.startDate) : null;
                endDate = req.query.endDate ? new Date(req.query.endDate) : null;
                break;
            default:
                startDate = null;
                endDate = null;
        }
        const inputDate = {
          startDate:startDate,
          endDate:endDate
        };
        const dateFilter = startDate && endDate ? {orderDate: { $gte: startDate, $lte: endDate }, status: 'Delivered' } : {status:'Delivered'};
       const orders = await Order.find(dateFilter, null, { skip, limit: perPage }).sort({ orderDate: -1 });
       const totalorders = await Order.countDocuments(dateFilter);
       const totalPages = Math.ceil(totalorders /perPage);
       const modifiedOrders = [];
        for (const order of orders) {
            const user = await Users.findById(order.userId);
            const productslist = await products.find({ _id: { $in: order.item.map(itemeach => itemeach.productId) } });
            
            const productsWithTotalPrice = productslist.map(product => {
              const quantity = order.item.find(item => item.productId.toString() === product._id.toString()).quantity;
              const totalPriceForProduct = product.price.OriginalPrice * quantity;
      
              return {
                  ...product.toObject(),
                  totalPrice: totalPriceForProduct
              };
          });      
          const totalPriceOfOrder = productsWithTotalPrice.reduce((total, product) => total + product.totalPrice, 0);
            const modifiedOrder = {
                _id: order._id,
                user: { email: user.email, name: user.userName },
                products: productslist.map(product => ({ title: product.title })),
                address: order.address,
                orderDate: (() => {
                  const date = new Date(order.orderDate);
                  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
                  return date.toLocaleDateString('en-IN', options);
              })(),
                paymentType: order.paymentType,
                mrprice: totalPriceOfOrder,
                totalPrice: order.totalPrice
            };
            modifiedOrders.push(modifiedOrder);
        }
        res.render('salesReport',{sidebarpointer:'salesreport Admin', allData:modifiedOrders, page,filter,  totalPages,inputDate })

  }catch(err){
    console.error('error in sales report',err);
  }
}


const generatePdfSalesReport = async (req, res) => {
  try{
  const orders = await Order.aggregate([
    {
      $match: {
        status: "Delivered",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "item.productId",
        foreignField: "_id",
        as: "products",
      },
    },
    {
      $sort: {
        orderDate: -1,
      },
    },
    {
      $project: {
        _id: 1,
        orderDate: {
          $dateToString: {
            format: "%d-%m-%Y %H:%M",
            date: "$orderDate",
          },
        },
        userName: "$user.userName",
        userEmail: "$user.email",
        products: "$products.title",
        address: 1,
        paymentType: 1,
        totalPrice: 1,
      },
    },
  ]);
  let totalSalesAmount = 0;
  const totalOrders = orders.length;
  for (let order of orders) {
    totalSalesAmount += parseInt(order.totalPrice);
  }

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=Math.random()+sales_report.pdf");

  doc.pipe(res);
  doc
    .image("./public/img/desert-logos_black_croped.png", 0, 5, { width: 180 })
    .fillColor("#444444")
    .fontSize(20)
    .text("Sales Report", 110, 57, { align: "center" })
    .fontSize(13)
    .text(`Total Rs: ${totalSalesAmount}`, 200, 80, { align: "right" })
    .text(`Orders : ${totalOrders}`, 200, 65, { align: "right" })
    .moveDown();

  const table = {
    headers: [
      "No",
      "Customer Email & Name",
      "OrderId",
      "Products",
      "Address",
      "Order Date",
      "Payment mode",
      "Amount",
    ],
    rows: [],
  };
  let index = 1;
  for (const order of orders) {
    const user = `${order.userEmail}\n(${order.userName})`;
    const productsString = order.products.map((product, index) => index === order.products.length-1 ? product : product + ',').join('\n');
    const addressdetails = `${order.address.name}\n${order.address.address},\n${order.address.locality},\n${order.address.city},\n${order.address.pincode},\nmob:${order.address.number}`;
    table.rows.push([
      index++,
      user,
      "#" + order._id,
      productsString,
      addressdetails,
      order.orderDate,
      order.paymentType,
      "Rs. " + order.totalPrice,
    ]);
  }
  doc.moveDown().table(table, 10, 125, { width: 590 });

  doc.end();
}catch(err){
  console.error('error in pdf download');
}
};


const  generateExcelSalesReport = async (req,res) => {
  try{
  const orders = await Order.aggregate([
    {
      $match: {
        status: "Delivered",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "item.productId",
        foreignField: "_id",
        as: "products",
      },
    },
    {
      $sort: {
        orderDate: -1,
      },
    },
    {
      $project: {
        _id: 1,
        orderDate: {
          $dateToString: {
            format: "%d-%m-%Y %H:%M",
            date: "$orderDate",
          },
        },
        userName: "$user.userName",
        userEmail: "$user.email",
        products: "$products.title",
        address: 1,
        paymentType: 1,
        totalPrice: 1,
      },
    },
  ]);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet();

    worksheet.columns = [
        { header: 'Order ID', key: 'No', width: 10 },
        { header: 'Customer Name', key: 'customerName', width: 20 },
        { header: 'address', key: 'address', width: 20 },
        { header: 'paymentType', key: 'paymentType', width: 20 },
        { header: 'orderDate', key: 'orderDate', width: 20 },
        { header: 'products', key: 'products', width: 20 },
        { header: 'totalPrice', key: 'totalPrice', width: 20 },
    ];
    let index =1,totalpriceSum = 0;
    orders.forEach(order => {
      const customerName = order.userName.length > 0 && order.userEmail.length > 0 ? `${order.userName[0]}, ${order.userEmail[0]}` : 'Unknown';
      const addressdetails = `${order.address.name},${order.address.address},${order.address.locality},${order.address.city},${order.address.pincode},mob:${order.address.number}`;
      const productsString = order.products.map((product, index) => index === order.products.length-1 ? product : product + ',').join('\n');
      totalpriceSum += parseFloat(order.totalPrice);
      worksheet.addRow({
            No: index++,
            customerName: customerName,
            address: addressdetails,
            paymentType: order.paymentType,
            orderDate: order.orderDate,
            products: productsString,
            totalPrice: order.totalPrice
        });
      });
      worksheet.addRow({
        No: '',
        customerName: '',
        address: '',
        paymenttype: '',
        orderDate: '',
        products: 'TotalAmount',
        totalPrice: totalpriceSum
      })
    await workbook.xlsx.writeBuffer()
    .then(buffer => {
      res.set('Content-Type', 'aplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.set('Content-Disposition', 'attachment; filename=sales_report+Math.random().xlsx')
      res.send(buffer)
    })
    .catch(err => {
      console.error('Error generating Excel file:',err)
      res.status(500).json({error: "Internal server error"})
    })

}catch(err){
  console.error('error in excel download',err);
}
};




const logoutpost = (req,res) => {   
  delete req.session.admin;
  res.redirect('/admin/login')
}


module.exports = {
    loginland,loginpost,
    dashboardland,dashChart,
    categoryland,updateCategorySatatus,deleteCategory,editCategoryName,createCategory,
    productsland,updateproductSatatus,deleteProduct,editProduct,editProductpost,createProduct,createProductPost,
    usersland,updateUserSatatus,
    offersland,offerspost,fetchcategory,fetchprodcuts,updateOfferSatatus,deleteoffer,
    ordersland,ordercancel,ordertoggle,
    couponsland,couponspost,updateCouponSatatus,deletecoupon,
    salesreportland,generatePdfSalesReport,generateExcelSalesReport,

    uploaded, /*middleware*/
    
    logoutpost
}
