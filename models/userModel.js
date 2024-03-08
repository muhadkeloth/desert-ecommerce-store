const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  pincode: { type: String, required: true },
  locality: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  landmark: { type: String }
});

const usersSchema = new mongoose.Schema({
    userName:{type:String,require:true},
    email:{type:String,require:true,unique:true,match:/^[^\s@]+@[^\s@]+\.[^\s@]+$/},
    phoneNumber:{type:String,unique:true,require:true},
    password:{type:String,require:true},
    blockStatus:{type:Boolean,default:true},
    wallet:{type:Number,default:0},
    wallethistory:[{
      orderId:{
          type:mongoose.Types.ObjectId,
          ref:'Order',
          required:true,
      },
      date:{type:Date},
      amount:{type:Number,required:true}
  }],
    addresses: [addressSchema]
     
})

module.exports = mongoose.model('Users',usersSchema);