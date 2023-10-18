const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
  },
  quantity: {
    type: Number,
   default: 1,
  },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
  },
  items: [cartItemSchema],
});

module.exports = mongoose.model("Cart", cartSchema);
