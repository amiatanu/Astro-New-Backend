const mongoose = require("mongoose");

const Token = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
  },
  astrologerId: {
    type: String,
    ref: "AStrologer Id",
  },
  channel: {
    type: String,
  },
  rtcToken: {
    type: String,
  },

  rtmToken: {
    type: String,
  },
  consultationTtype: {
    type: String,
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now, // Set the default value to the current date and time
  },
});

module.exports = mongoose.model("Token", Token);
