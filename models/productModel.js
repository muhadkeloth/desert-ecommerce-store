const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
    title:{type:String,require:true,unique:true},
    subtitle:String,
    description:{type:String,require:true},
    brand:{type:String,require:true},
    price:{
        CurrentPrice:Number,
        offer:Number,
        OriginalPrice:{type:Number,require:true}
    },
    colors:{type:[String],require:true},
    category:{type:mongoose.Schema.Types.ObjectId,ref: "categorys",require:true},
    stocks:{
        Size40:Number,
        Size41:Number,
        Size42:Number,
        Size43:Number,
        Size44:Number
    },
    Status:{type:Boolean,default:true},
    images: { type: [String], required: true }  
})

module.exports = mongoose.model('products',productsSchema);



