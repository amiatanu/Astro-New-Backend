const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      productId: {
        type: String,
        ref: 'Product',
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
