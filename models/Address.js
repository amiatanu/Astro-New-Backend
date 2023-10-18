const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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

module.exports = mongoose.model("Address", addressSchema);
