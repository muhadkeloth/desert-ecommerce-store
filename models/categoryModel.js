const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName:{type:String,unique:true,require:true},
    Status:{type:Boolean,default:true},     
})

module.exports = mongoose.model('categorys',categorySchema);