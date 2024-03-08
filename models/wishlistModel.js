const mongoose = require('mongoose');

const wishlistSchema  = mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"users",
        required:true,
    },
    item:[{
        productId:{
            type:mongoose.Types.ObjectId,
            ref:'Products',
            required:true,
        },
        quantity:{type:Number,default:1},
        size:{type:String,required:true}
    }]
})

module.exports = mongoose.model('Wishlist',wishlistSchema);



