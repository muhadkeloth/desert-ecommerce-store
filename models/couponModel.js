const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
    title:{type:String,required:true},
    startDate:{type:Date,required:true},
    expDate:{type:Date},
    couponCode:{type:String,required:true,unique:true},
    percentage: {type: Number,required: true},
    minCartValue: {type: Number,required: true},
    maxDiscount: {type: Number,required: true},
    status:{type:Boolean,default:true},
    usedIds:[{type: mongoose.Schema.Types.ObjectId,ref: 'Users'}]    
})

module.exports = mongoose.model('Coupon',couponSchema);