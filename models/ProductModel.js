const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productTitle: String,
  category: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    name: String,
  },
  quantity: Number,
  mainImage: String,
  otherImages: [String],
  productDescription: String,
  MRP: Number,
  discountPrice: Number,
  stocksAvailable: Number,
});

module.exports = mongoose.model("Product", productSchema);
