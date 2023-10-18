const mongoose = require("mongoose");
const { Schema } = mongoose;

const availabilitySlotSchema = new Schema({
  astrologer: {
    type: Schema.Types.ObjectId,
    ref: "Astrologer",
    required: true,
  },
  day: {
    type: String, // Monday, Tuesday, etc.
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  slots: [
    {
      slotId: {
        type: Schema.Types.ObjectId,
      },
      startTime: {
        type: String, // Store start time as a string
        required: true,
      },
      endTime: {
        type: String, // Store end time as a string
        required: true,
      },
      statusofBooking: {
        type: String,
        default: "Empty", //Empty=>not booked==>Reserved==>booked
      },
    },
  ],
});

module.exports = mongoose.model("AvailabilitySlot", availabilitySlotSchema);
