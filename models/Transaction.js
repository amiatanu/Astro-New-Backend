const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  walletId: {
    type: String,
    ref: "User Wallet",
  },
  amount: Number,
  type: {
    type: String,
    enum: ["credit", "debit"],
  },
  timestamp: {
    type: Date,
    default: Date.now, // Set the default value to the current date and time
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
