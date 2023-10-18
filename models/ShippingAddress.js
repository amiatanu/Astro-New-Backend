const mongoose = require("mongoose");

const shippingaddressSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
  },
  shippingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shipping",
  },
  name: {
    type: String,
  },
  mobileNo: {
    type: String,
  },
  currentAddress: {
    type: String,
  },
  pincode: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
});

module.exports = mongoose.model("ShippingAddress", shippingaddressSchema);
