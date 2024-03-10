const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  item: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
      
        required: true,
      },
      size:{type:String,required:true}
    },
  ],
  totalPrice: {
    type: String,
  },
  orderDate: {
    type: Date,
    default:Date.now()
  },
  deliveryDate: {
    type: Date,
    default: function() {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 7); 
      return currentDate;
    }
  },
  status: {
    type: String,
    default:"Placed"
  },
  address: {
    name: { type: String, required: true },
    number: { type: String, required: true },
    pincode: { type: String, required: true },
    locality: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    landmark: { type: String }
  },
  paymentType: {
    type: String,
  },
  CancelReason:{type:String}
});

module.exports = mongoose.model("Order", orderSchema);
