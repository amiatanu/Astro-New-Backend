const mongoose = require("mongoose");

const ConsultationTimeCounter = new mongoose.Schema({
  consultationId: {
    type: String,
    ref: "User",
  },
  userId: {
    type: String,
    ref: "User",
  },
  astrologerId: {
    type: String,
    ref: "Astrologer",
    required: true,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  consultaionDuration: {
    type: Number,
  },
  consultationStatus: {
    type: String,
  },
  consultationCharge: {
    type: Number,
  },
  consultationtype: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model(
  "ConsultationTimeCounter",
  ConsultationTimeCounter
);
