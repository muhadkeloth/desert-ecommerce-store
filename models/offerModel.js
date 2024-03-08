const mongoose = require("mongoose");

const offerSchema = mongoose.Schema({
    name:{type:String,required:true},
    category:{type:mongoose.Schema.Types.ObjectId,ref:"categorys"},
    products:[{type:mongoose.Schema.Types.ObjectId,ref:"products"}],
    percentage:{type:Number,required:true},
    status:{type:Boolean,default:true}
});

module.exports = mongoose.model("Offer",offerSchema);