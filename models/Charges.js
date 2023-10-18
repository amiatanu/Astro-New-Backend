const mongoose = require("mongoose");

const astrologerCharges = new mongoose.Schema({
  astrologerId: {
    type: String,
    ref: "Astrologer", // Reference to the Astrologer model
    required: true,
  },
  chatFee: {
    type: Number,
    default: 1,
  },
  videoCallFee: {
    type: Number,
    default: 1,
  },
  audioCallFee: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("Charges", astrologerCharges);
