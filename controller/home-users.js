const products = require('../models/productModel');
const Users = require('../models/userModel');
const categorys = require('../models/categoryModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel'); 
const Coupon = require('../models/couponModel');
const Wishlist = require('../models/wishlistModel'); 
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY ,ADMIN_ID } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});


const homeland = async (req,res) => {
    try{
    const product = await products.aggregate([{$sample: {size: 9}}]);
    const category = await categorys.find({Status:true});
    let userId = false;
        if(!req.session?.user){
            res.render('homepage',{product,userId, category,title:'Desert home page' })        
        }else{
            userId = await Users.findOne({_id:req.session.user});
            res.render('homepage',{product,userId, category, title:'Desert home page'})
        }
    }catch(err){
        console.error('error on homepage land ',err.message);
    }
}


const productlists = async (req, res) => {
    let search = '';
    const userId = req.session?.user ?? false;
    const {gender,priceRange,color,sort} = req.query;
    if (req.params.search && req.params.search !== '0') {
        search = req.params.search;
    } else if (req.query.search && req.query.search !== '0') {
        search = req.query.search;
    } 
    let sortQuery = {}; 
    if (sort) {
        switch (sort) {
            case 'Popularity':
                sortQuery = { popularity: -1 };
                break;
                case 'LtoH':
                    sortQuery = { 'price.OriginalPrice': 1 };
                break;
            case 'HtoL':
                sortQuery = { 'price.OriginalPrice': -1 };
                break;
                default:
                    sortQuery = { createdAt: -1 }; 
                    break;
                }
            }
            const perPage = 12;
            const page = parseInt(req.query.page) || 1;
            const skip = (page - 1) * perPage;
    try {   
        let productsQuery = {};
        if(gender){
            productsQuery.category = gender;
        }
        if(priceRange){
            switch (priceRange) {
                case '10000':
                    productsQuery['price.OriginalPrice'] = { $lt: 10000 };
                    break;
                case '15000':
                    productsQuery['price.OriginalPrice'] = { $gte: 10000, $lt: 15000 };
                    break;
                case '20000':
                    productsQuery['price.OriginalPrice'] = { $gte: 15000, $lt: 20000 };
                    break;
                case '25000':
                    productsQuery['price.OriginalPrice'] = { $gte: 20000 };
                    break;
                default:
                    break;
            }
        }
        if(color){
            if(Array.isArray(color)){
                productsQuery.colors = { $in: color };
            }else{
                productsQuery.colors = color;
            }
        }
        if (search) {
            const productName = new RegExp(search, 'i');
            productsQuery.title = productName;
        }
        const productslist = await products
        .find(productsQuery)
        .sort(sortQuery)
        .skip(skip)
        .limit(perPage);
        const categorylist = await categorys.find({Status:true});
        const totalCount = await products.countDocuments(productsQuery);
        const totalPages = Math.ceil(totalCount / perPage);
        productsQuery.colors = color;
        productsQuery.priceRange = priceRange;
        res.render('productlist', { productslist, totalPages,categorylist, page,title:'Desert Products', search, userId,productsQuery, sort });
    } catch (err) {
        console.error('Error fetching product list from backend:', err);
    }
};


const productdetails = async (req,res) => {
    try{
        const userId = req.session?.user || false;
        const productId = req.query.productId;
        const productdetails = await products.findById(productId)
        res.render('productdetails',{userId,productdetails,title:'Product details'})
    }catch(err){
        console.error('roductdetails eror land ',err);
    }
}


const profileland = async (req,res) => {
    try{
        const userId = req.session?.user || false;
        let message =req.query.message || false;
        if(message =='editsuccess'){
            message = {
                bg:'text-bg-success',
                innertext:'user profile updated successfully'
            }
        }else if(message =='changepassfailed'){
            message ={ bg:'text-bg-danger',innertext:'failed changing password'}
        }else if(message=='changepassmismatchfailed'){
            message ={ bg:'text-bg-danger',innertext:'old password not currect'}
        }else if(message=='passchangesuccess'){
            message = {bg:'text-bg-success',innertext:'user password updated successfully'}
        }
        const userdetails = await Users.findById(userId);
            res.render('profileland',{userId, userdetails, message ,title:'profile details'})
    }catch(err){
        console.error('profile land error ',err);
    }
}


const profileEditland = async (req,res) => {
    const userId = req.session?.user || false;
    const userdetails = await Users.findById(userId);
        res.render('profileEdit',{userId, userdetails ,title:'Edit profile'})
}


const profileEditPost = async (req,res) => {
    const userId = req.session.user
    const {username , phonenumber } = req.body;
    try{
        const updateduser = await Users.findByIdAndUpdate(userId,{
            $set:{
                userName:username,
                phoneNunber:phonenumber
            }
        },{new:true})
        if(updateduser){
            res.redirect('/profile?message=editsuccess');
        }else{
            res.redirect('/profileEdit');
        }
    }catch(err){
        console.error('error in edit profile user',err);
    }
}


const profilechangepasswordland = async (req,res) => {
    const userId = req.session?.user || false;
    res.render('profilechangepass',{ userId, title:'Edit password'})
}


const profilechangepasswordpost = async (req,res) => {
    try{
        const {password, newpassword} =req.body;
        const userId = req.session?.user || false;
        const userdata = await Users.findById(userId)
        const passwordMatch = await bcrypt.compare(password,userdata.password)
        if(!passwordMatch){
            return  res.redirect('/profile?message=changepassmismatchfailed');
        }
        const hashedPassword = await bcrypt.hash(newpassword,10);
        const updateduserdata = await Users.findByIdAndUpdate(userId,{
            $set:{password:hashedPassword}
        },{new:true});
        if(!updateduserdata){
            return  res.redirect('/profile?message=changepassfailed');
        }
        res.redirect('/profile?message=passchangesuccess');            
    }catch(err){
        console.error('error in changing user password in profile ',err);
    }
}


const profileAddressland = async (req,res) => {
    try{
        let message =req.query.message || false;
            if(message =='deletesuccess'){
                message = {bg:'text-bg-success',innertext:' Address removed successfully'} 
            }else if(message == 'deleetefailed'){
                message = {bg:'text-bg-danger',innertext:' Address removed failed'}
            }else if(message == 'createsuccess'){
                message = {bg:'text-bg-success',innertext:' Address created successfully'} 
            }else if(message =='editfaild'){
                message = {bg:'text-bg-danger',innertext:' Address edit failed'}
            }else if (message == 'editsuccess'){
                message = {bg:'text-bg-success',innertext:' Address edit successfully'}
            }
        const userId = req.session?.user || false;
        const address = await Users.findById(userId)  
        const addresses = address?.addresses ;
        res.render('profileAddress',{ userId,addresses, title:'Address Info', message})
    }catch(err){
        console.error('error in profileaddressland',err);
    }
}


const profileAddressCreatepost = async (req,res) => {
    try{
        const {name, number, pincode, locality, address, city, landmark} = req.body;
        const userId = req.session.user;
        const updateaddress = await Users.findByIdAndUpdate(userId,{
            $push:{
                addresses:{
                    name:name,
                    number:number,
                    pincode:pincode,
                    locality:locality,
                    address:address,
                    city:city,
                    landmark:landmark || ''
                }
            }
        },{new:true,upsert:true})
        if(updateaddress){
            res.redirect('/profileAddress?message=createsuccess')
        }
    }catch(err){
        console.error('error in createprofileaddresss',err);
    }
}


const profileAddresseditpost  = async (req,res) => {
    const {name, number, pincode, locality, address, city, landmark} = req.body;
    const userId = req.session.user;
    const index = req.query.index;
    const from = req.query?.from;
    try{
        const userDoc = await Users.findById(userId);
        if(!userDoc){
            if(!from){
                return res.redirect('/profileAddress?message=editfaild');
            }else{
                return res.redirect('/checkout?message=editfaild');                
            }
        }
        userDoc.addresses[index] = {
            name:name,
            number:number,
            pincode:pincode,
            locality:locality,
            address:address,
            city:city,
            landmark:landmark || ''
        }
        await userDoc.save();
        if(from){
            return res.redirect('/checkout?message=editsuccess');    
        }
         res.redirect('/profileAddress?message=editsuccess');    
    }catch(err){
    console.error('error in editaddress',err);
}
}


const profileAddressdeleteland = async(req,res) => {
    const index = parseInt(req.params.index);
    const userId = req.session.user;
    try{
        const userDoc = await Users.findById(userId);
        if(!userDoc){
            return res.redirect('/profileAddress?message=deleetefailed')
        }
        userDoc.addresses.splice(index,1);
        await userDoc.save();
        res.redirect('/profileAddress?message=deletesuccess')
    }catch(err){
        console.error('error in deleteaddress',err);
    }
}


const cartland = async (req,res) => {
    const amount = {totalPrice : 0,dis : 0};
    const userId = req.session?.user || false;
    try{
        const cartdata = await Cart.findOne({userId:userId});
        if(!cartdata){
           return res.render('cartpage',{userId,amount,title:'Cart page', cartdocs:false})
        }
        const cartdocs = await Cart.aggregate([{
            $match: {userId: new mongoose.Types.ObjectId(userId)}
        },{
            $unwind:"$item"
        },{
            $lookup: {
                from: "products",
                localField: "item.productId",
                foreignField: "_id",
                as: "item.product"
            }
        },{
             $unwind: "$item.product"
        },{
            $lookup:{
                from:"categorys",
                localField: "item.product.category",
                foreignField:"_id",
                as:"item.product.category"
            }
        },{
            $unwind:"$item.product.category"
        },{
            $replaceRoot:{
                newRoot:"$item"
            }
        },{
            $lookup:{
                from:"products",
                localField:"productId",
                foreignField:"_id",
                as:"product"
            }
        },{
            $unwind:"$product"
        },{
            $project:{
                productId:1,
                quantity:1,
                size:1,
                productId:"$product._id",
                title:"$product.title",
                subtitle:"$product.subtitle",
                stocks: "$product.stocks", 
                images: "$product.images", 
                colors: "$product.colors", 
                price: "$product.price"
            }
        }]);
         if(cartdocs.length > 0) {
            for(let i =0 ;i < cartdocs.length ; i++){
                amount.totalPrice += cartdocs[i].price.OriginalPrice * (1 - (cartdocs[i].price.offer ?? 0) /100)  * cartdocs[i].quantity;
                amount.dis += cartdocs[i].price.OriginalPrice * ((cartdocs[i].price.offer ?? 0) /100)  * cartdocs[i].quantity;
            }
        }
        res.render('cartpage',{userId,amount,cartdocs, title:'Cart page'})
    }catch(err){
        console.error('cartpage load error',err);
    }
}


const addtocartpost = async (req,res) => {
    const {size, qty} = req.body;
    const userid = req.session.user;
    const productId = req.query.productId;
    let result;
    try{
        const usercart = await Cart.findOne({userId:userid});
        if(usercart){
            let flag =1;
             for (let i = 0 ; i< usercart.item.length ; i++) {
                if(usercart.item[i].productId.toString() === productId && usercart.item[i].size === size){
                    let newqty =  usercart.item[i].quantity + parseInt(qty);
                    usercart.item[i].quantity = newqty <=5 ? newqty : usercart.item[i].quantity;
                   result=  await usercart.save();
                   flag=0;
                        break;
                }                        
             }if(flag){
                const cartdata = {
                    productId:productId,
                    quantity:qty,
                    size:size
                };
                usercart.item.push(cartdata)
                result = await usercart.save()
             }
        }else{
            const newcartdata = {
                userId:userid,
                item:[{productId:productId,
                quantity:qty,
                size:size}]
            }
            const newcartlist = new Cart(newcartdata);
            result = await newcartlist.save();
        }
        if(result){
            res.status(200).json({result:true,message:'product added to cart successfully'})
        }else{
            res.status(500).json({result:false,message:'product adding to  cart failed'})
        }
    }catch(err){
        console.error('error in addto cartpost',err);
    }
}


const decrementIncrementCartpost = async (req,res) => {
    try{
        const {cartId  ,value} = req.body;
        const userId = req.session.user;
        const cartdoc = await Cart.findOne({userId});
        const item = cartdoc.item.find((i) => i._id.toString() === cartId);
        if(item){
            const productdetails = await products.findById(item.productId);
            const sizefit = item.size;
            item.quantity += value;

            if ( productdetails.stocks[sizefit] < item.quantity) {
              item.quantity = productdetails.stocks[sizefit];
              await cartdoc.save();
              return res.json({success:true, value:item.quantity, message:'Reached max quantity'})
            }
            if(item.quantity === 0) {
                cartdoc.item.pull({_id:item._id})
                await cartdoc.save();
                return res.json({success:false,message:'OUT OF STOCK'});
            }
        await cartdoc.save();
        return res.json({success:true, value:item.quantity})
        }
        res.status(400).json({success:false,message:'item not found'});
    }catch(err){
        console.error('error in increment decrement cart',err);
    }
}


const cartitemdeletedelete = async (req,res) => {
    const cartId = req.query.cartId;
    const userId = req.session.user;
    try{
        const result = await Cart.findOneAndUpdate(
            {userId},
            {$pull:{item:{_id:cartId}}},
            {new:true}
        );
        if(result) {
            res.json({success: true, message:'cart item deleted successfully'});
        }else{
            res.status(404).json({success:false,message:'cart item not found'})
        }
    }catch(err){
        console.error('error in delete cart item',err);
    }
}


const cartcountland =async (req,res) => {
    const userId = req.session.user;
    try{
        const cartCount = await Cart.aggregate([
            {$match:{userId: new mongoose.Types.ObjectId(userId)}},
            {$project:{itemCount:{$size:'$item'}}}
        ]);
        res.json({success:true,count:cartCount[0].itemCount})
    }catch(err){
        console.error('error in count cart',err);
    }
}


const checkoutland = async (req,res) => {
    try{
    const userId = req.session.user;
    const address = await Users.findById(userId);
    const wallet = address?.wallet;
    const addresses = address?.addresses ;
    let message =req.query.message || false;
    if(message =='editfaild'){
        message = {bg:'text-bg-danger',innertext:' Address edit failed'}
    }else if (message == 'editsuccess'){
        message = {bg:'text-bg-success',innertext:' Address edit successfully'}
    }
    if(!req.query.productId){
        const amount = {totalPrice : 0,dis : 0};
            const cartdata = await Cart.findOne({userId:userId});
            if(!cartdata){
               return res.redirect('/cart')
            }
            const cartdocs = await Cart.aggregate([{
                $match: {userId: new mongoose.Types.ObjectId(userId)}
            },{
                $unwind:"$item"
            },{
                $lookup: {
                    from: "products",
                    localField: "item.productId",
                    foreignField: "_id",
                    as: "item.product"
                }
            },{
                 $unwind: "$item.product"
            },{
                $lookup:{
                    from:"categorys",
                    localField: "item.product.category",
                    foreignField:"_id",
                    as:"item.product.category"
                }
            },{
                $unwind:"$item.product.category"
            },{
                $replaceRoot:{
                    newRoot:"$item"
                }
            },{
                $lookup:{
                    from:"products",
                    localField:"productId",
                    foreignField:"_id",
                    as:"product"
                }
            },{
                $unwind:"$product"
            },{
                $project:{
                    productId:1,
                    quantity:1,
                    size:1,
                    productId:"$product._id",
                    title:"$product.title",
                    subtitle:"$product.subtitle",
                    images: "$product.images", 
                    price: "$product.price"
                }
            }]);
             if(cartdocs.length > 0) {
                for(let i =0 ;i < cartdocs.length ; i++){
                    amount.totalPrice += cartdocs[i].price.OriginalPrice * (1 - (cartdocs[i].price.offer ?? 0) /100)  * cartdocs[i].quantity;
                    amount.dis += cartdocs[i].price.OriginalPrice * ((cartdocs[i].price.offer ?? 0) /100)  * cartdocs[i].quantity;             
                }
            }
            res.render('checkout',{userId,addresses,message,cartdocs,amount,wallet, title:'CheckOut page'})
    }
}catch(err){
    console.error('checkoutland error',err);
}   
}


const paymentsetup = async (req,res) => {
    try{
        const totalPrice  = req.body.totalPrice ;
        const cartdocs = JSON.parse(req.body.cartdocs);
        const userdata = await Users.findById(req.session.user);
        const contactNumber = "+91" + userdata.phoneNumber;
        let title ='',subtitle ='';
        cartdocs.forEach(item => {
            title += item.title + ' ' ;
            subtitle += item.subtitle + ' ' ;
        });
        const options = {
            amount: totalPrice * 100,
            currency: 'INR',
            receipt: ADMIN_ID,
        }
        razorpayInstance.orders.create(options,(err,order) => {
            if(!err){
                res.status(200).send({
                    success:true,
                    msg:'Order Created',
                    order_id:order.id,
                    amount:totalPrice * 100,
                    key_id: RAZORPAY_ID_KEY,
                    product_name: title ,
                    description: subtitle ,
                    contact: contactNumber ,
                    name:userdata.userName ,
                    email: userdata.email
                })
            }else{
                res.status(400).send({success:false,msg:'Something went wrong'})
            }
        })
    }catch(err){
        console.error('error in payment order',err);
    }
}


const confirmorder = async (req,res) => {
    try{
        const {selectedaddress, selectedpayment , totalPrice,walletdedect ,couponCode} = req.body;
        const status = req.body.status;
        const cartdocs = JSON.parse(req.body.cartdocs);
        const userdata = await Users.findById(req.session.user)
        const address = userdata.addresses[selectedaddress]
        const orderdoc = new Order({
            userId: new mongoose.Types.ObjectId(req.session.user),
            item:[],
            totalPrice:parseInt(totalPrice) + parseInt(walletdedect),
            address:address,
            paymentType:selectedpayment
        })
        for(const item of cartdocs){
            orderdoc.item.push({
                productId:new mongoose.Types.ObjectId(item.productId),
                price: item.price.OriginalPrice,
                quantity:item.quantity,
                size:item.size
            })
            await Cart.updateOne({userId:req.session.user},
                {$pull:{item:{_id:item._id}}})
        }
        if(status){
            orderdoc.status = status;
        }
        const orderconfirmed = await orderdoc.save() 
        if(parseInt(walletdedect)){
            userdata.wallet -= walletdedect;
            const currentDate = new Date();
            const wallethistoryEntry = {
            orderId: orderconfirmed,
            date: currentDate,
            amount: -walletdedect
        };
        userdata.wallethistory.push(wallethistoryEntry);
            await userdata.save();
        }
        if(couponCode){
            const couponadd = await Coupon.findOneAndUpdate({couponCode:couponCode},
                {$push:{usedIds:req.session.user}},
                {new:true});
        }
        if(status){
            res.status(200).json({success:false,message:"Payment Failed!"})
        }else{
            res.status(200).json({success:true});
        }
    }catch(err){
        console.error('error in confirm order',err);
    }
}


const repayment = async (req,res) => {
    try{
        const totalPrice  = req.body.totalPrice ;
        const orderId = req.body.orderId;
        const userdata = await Users.findById(req.session.user);
        const contactNumber = "+91" + userdata.phoneNumber;
        const options = {
            amount: totalPrice * 100,
            currency: 'INR',
            receipt: 'desertteam987@gmail.com',
        }
        razorpayInstance.orders.create(options,(err,order) => {
            if(!err){
                res.status(200).send({
                    success:true,
                    msg:'Order Created',
                    order_id:order.id,
                    amount:totalPrice * 100,
                    key_id: RAZORPAY_ID_KEY,
                    product_name: '#' + orderId ,
                    contact: contactNumber ,
                    name:userdata.userName ,
                    email: userdata.email
                })
            }else{
                res.status(400).send({success:false,msg:'Something went wrong'})
            }
        })
    }catch(err){
        console.error('error in payment order',err);
    }
}


const updateorderStatus = async (req,res) => {
    try{
        const orderdetails = await Order.findById(req.body.orderId);
        orderdetails.status = "Placed"
        const result = await orderdetails.save();
        if(result){
            res.status(200).json({success:true})
        }
    }catch(err){
        console.error('error in updateorder inorder details',err);
    }
}


const couponvalidationpost = async (req,res) => {
    try{
        const userId = req.session.user;
        const couponCode = req.body.couponCode;
        const coupon = await Coupon.findOne({couponCode,status:true});
        if(!coupon){
            return res.status(404).json({result:false,message:"Coupon not found"});
        }
        const isUser = coupon.usedIds.some(idcheck => idcheck.equals(new mongoose.Types.ObjectId(userId)));
        if(!isUser){
            const date = new Date();
            if(date >= coupon.startDate && date <= coupon.expDate){
                if(coupon.minCartValue > req.body.totalCartValue){
                    return res.json({result:false,message:`Entered Coupon need minimum cart value ${coupon.minCartValue}`})
                }
                return res.json({result:true,coupon});
            }else{
                return res.status(400).json({result:false,message:"Coupon is expired"})
            }
        }else{
            return res.status(400).json({result:false,message:"Couponalready used"})
        }
    }catch(err){
        console.error('error in coupon code validation',err);
    }

}

const ordersland = async (req,res) => {
    const userId = req.session?.user || false;
    const page = parseInt(req.query.page,10) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    try{
        const totalorder =await Order.countDocuments({ userId: userId });
        const totalPages = Math.ceil(totalorder /limit);
        const orderDetails = await Order.aggregate([
            {
                $match:{userId:new mongoose.Types.ObjectId(userId)}
            },{
                $unwind:"$item"
            },{
                $lookup:{
                    from:"products",
                    localField:"item.productId",
                    foreignField:"_id",
                    as:"productDetails"
                }
            },{
                $project: {
                    _id: 1,
                    totalPrice:1,
                    status: 1,
                    paymentType:1,
                    orderDate: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
                    deliveryDate: { $dateToString: { format: "%Y-%m-%d", date: "$deliveryDate" } },
                    item: {
                        productId: "$item.productId",
                        size: "$item.size",
                        quantity: "$item.quantity",
                        price: "$item.price",
                        image: { $arrayElemAt: ["$productDetails.images", 0] },
                        title: { $arrayElemAt: ["$productDetails.title", 0] } 
                    }
                }           
            },{
                $group: { 
                    _id: "$_id",
                    totalPrice: {$first:"$totalPrice"},
                    status: { $first: "$status" },
                    paymentType: { $first: "$paymentType" },
                    orderDate: { $first: "$orderDate" },
                    deliveryDate: { $first: "$deliveryDate" },
                    items: { $push: "$item" }
                }
            }
        ]).sort({_id:-1}).skip(skip).limit(limit);
        res.render('profileorders',{ userId,orderDetails, title:'My Orders',totalPages,page})   
    }catch(err){
        console.error('error in orders fetch',err);
    }    
}

const orderdetailsland = async (req,res) => {
    const userId = req.session.user;
    const orderId = req.query.orderId;
    if(!orderId){
       return res.redirect('/orders')
    }
    const orderDetails = await Order.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(orderId) }
        },
        {
            $unwind: "$item"
        },
        {
            $lookup: {
                from: "products",
                localField: "item.productId",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        {
            $addFields: {
                "item.title": { $arrayElemAt: ["$productDetails.title", 0] },
                "item.image": { $arrayElemAt: ["$productDetails.images", 0] }
            }
        },
        {
            $group:{
                _id:"$_id",
                totalPrice:{$first:"$totalPrice"},
                status: { $first: "$status" },
                address: { $first: "$address" },
                paymentType: { $first: "$paymentType" },
                orderDate: { $first: { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$orderDate" } } },
                deliveryDate: { $first: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } } },
                item: { $push: "$item" }
            }
        },
        {
            $project: {
                _id: 1,
                orderDate: 1,
                deliveryDate: 1,
                paymentType: 1,
                status: 1,
                totalPrice: 1,
                address: 1,
                item: 1,
            }
        }
    ]);
    const user = await Users.findById(userId);
    let walletHistory;
    if (user?.wallethistory?.length > 0) {
        walletHistory = user.wallethistory.find(entry => entry.orderId.toString() === orderId.toString());
    }    
    res.render('profileorderdetails',{ userId, orderDetails ,walletHistory , title:'My Orders'})
}

const ordercancelpost = async (req,res) => {
    const {orderId,inputreason} = req.body;
    const userId = req.session.user;
    try{
        const orderdoc = await Order.findById(orderId);
        let statusToUpdate = 'Cancelled';    
    if (orderdoc.status === 'Delivered') {
      statusToUpdate = 'Returned'; 
    }

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
    orderdoc.status = statusToUpdate;
    orderdoc.CancelReason = inputreason;
    const result = await orderdoc.save();
    if(result){
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


const wishlistland = async (req,res) => {
    const userId = req.session?.user || false;
    const page = parseInt(req.query.page,10) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    try{
        const totalItemsAggregate = await Wishlist.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId) }
            },
            {
                $unwind: "$item"
            },
            {
                $group: {
                    _id: null,
                    totalItems: { $sum: 1 }
                }
            }
        ]);
        const totalItems = totalItemsAggregate.length > 0 ? totalItemsAggregate[0].totalItems : 0;
        const totalPages = Math.ceil(totalItems / limit);
        const wishlistDetails = await Wishlist.aggregate([
            {
                $match:{userId:new mongoose.Types.ObjectId(userId)}
            },{
                $unwind:"$item"
            },{
                $lookup:{
                    from:"products",
                    localField:"item.productId",
                    foreignField:"_id",
                    as:"productDetails"
                }
            },{
                $project: {
                    _id: 1,
                    item: {
                        productId: "$item.productId",
                        size: "$item.size",
                        quantity: "$item.quantity",
                        price: { $arrayElemAt: ["$productDetails.price.OriginalPrice", 0] },
                        offer: { $arrayElemAt: ["$productDetails.price.offer", 0] },
                        image: { $arrayElemAt: ["$productDetails.images", 0] },
                        title: { $arrayElemAt: ["$productDetails.title", 0] } 
                    }
                }           
            },{
                $sort : {_id:-1}
            },{
                $skip : skip
            },{
                $limit : limit
            },{
                $group: { 
                    _id: "$_id",
                    items: { $push: "$item" }
                }
            }
        ]);
        res.render('wishlist',{ userId,wishlistDetails, title:'Wishlist',totalPages,page, totalItems})   
    }catch(err){
        console.error('error in wishlist fetch',err);
    }   
}

const wishlistadd = async (req,res) => {
    const {size, qty} = req.body;
    const userid = req.session.user;
    const productId = req.query.productId;
    let result;
    try{
        const userwishlist = await Wishlist.findOne({userId:userid});
        if(userwishlist){
            let flag = 1;
             for (let i = 0 ; i< userwishlist.item.length ; i++) {
                if(userwishlist.item[i].productId.toString() === productId && userwishlist.item[i].size === size){
                   return res.status(200).json({result:true,message:'product already added to wishlist'})
                }                        
             }if(flag){
                const wishlistdata = {
                    productId:productId,
                    quantity:qty,
                    size:size
                };
                userwishlist.item.push(wishlistdata)
                result = await userwishlist.save()
             }
        }else{
            const newwishlistdata = {
                userId:userid,
                item:[{productId:productId,
                quantity:qty,
                size:size}]
            }
            const newwishlistlist = new Wishlist(newwishlistdata);
            result = await newwishlistlist.save();
        }
        if(result){
            res.status(200).json({result:true,message:'product added to wishlist successfully'})
        }else{
            res.status(500).json({result:false,message:'product adding to  wishlist failed'})
        }
    }catch(err){
        console.error('error in add to wishlist post',err);
    }
}


const wishlistcountland = async (req,res) => {
    const userId = req.session.user;
    try{
        const wishlistDoc = await Wishlist.findOne({ userId: userId });
        if (wishlistDoc) {
          const itemCount = wishlistDoc.item.length; 
          res.json({ success: true, count: itemCount });
        } else {
          res.json({ success: false, message: 'Wishlist not found for user' });
        }        
    }catch(err){
        console.error('error in count cart',err);
    }
}


const wishlistitemdelete = async (req,res) => {
    const productId = req.query.productId;
    const userId = req.session.user;
    try{
        const result = await Wishlist.findOneAndUpdate(
            {userId},
            {$pull:{item:{productId:productId}}},
            {new:true}
        );
        if(result) {
            res.json({success: true, message:'item deleted successfully'});
        }else{
            res.status(404).json({success:false,message:'cart item not found'})
        }
    }catch(err){
        console.error('error in delete cart item',err);
    }
}


const walletland = async (req,res) => {
    const userId = req.session?.user || false;
    const page = parseInt(req.query.page,10) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    try{
    let userData = await Users.findById(userId,{password:0});
    let totalWallet = 0;    
    if (userData?.wallethistory.length > 0) {
        userData.wallethistory = userData.wallethistory.sort((a, b) => b.date - a.date);
        totalWallet = userData.wallethistory.length;
        userData.wallethistory = userData.wallethistory.slice(skip, skip + limit)
    }
    const totalPages = Math.ceil(totalWallet /limit);
    
        res.render('profilewallet', { userId, page, totalPages, walletdetails: userData,  title: 'Wallet' });
   
    }catch(err){
        console.error('error in wallet fetch',err);
    } 
}


const logout = (req,res) => {
    delete req.session.user;
    res.redirect('/');
}


module.exports = {
    homeland,
    productlists,
    productdetails,
    profileland,
    profileEditland,profileEditPost,
    profilechangepasswordland,profilechangepasswordpost,
    profileAddressland,profileAddressCreatepost,profileAddresseditpost,profileAddressdeleteland,
    cartland,addtocartpost,decrementIncrementCartpost,cartitemdeletedelete,
    checkoutland,couponvalidationpost,paymentsetup,confirmorder,
    ordersland,updateorderStatus,orderdetailsland,ordercancelpost,repayment,
    wishlistland,wishlistadd,wishlistitemdelete,   
    walletland,
    wishlistcountland,cartcountland,

    logout
}


