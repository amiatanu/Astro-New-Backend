const AvailabilitySlot = require("../models/AvailabilitySlot");
const moment = require("moment");
const { parse, format } = require("date-fns");

//set  slots for multiple date and time

// Controller to create availability slots for multiple days and times
async function setAvailability(req, res) {
  try {
    const { schedule } = req.body;
    const astrologerId = req.params.astrologerId;

    // Validate day input
    const validDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Initialize an empty array to store all time slots
    const allTimeSlots = [];

    // Loop through each day in the schedule
    for (const entry of schedule) {
      const { day, slots } = entry;

      if (!validDays.includes(day)) {
        return res.status(400).json({ message: "Invalid day of the week" });
      }

      // Loop through each provided slot for the current day
      for (const slot of slots) {
        const { startTime, endTime } = slot;

        // Parse start and end times as moment objects for easier manipulation
        const startMoment = moment(startTime, "hh:mm A");
        const endMoment = moment(endTime, "hh:mm A");

        // Ensure that the start time is before the end time
        if (!startMoment.isBefore(endMoment)) {
          return res
            .status(400)
            .json({ message: "Start time must be before end time" });
        }

        // Generate slots of 15 minutes interval between start and end times
        const currentMoment = moment(startMoment);
        while (currentMoment.isBefore(endMoment)) {
          const slotStartTime = currentMoment.format("hh:mm A");
          currentMoment.add(15, "minutes");
          const slotEndTime = currentMoment.format("hh:mm A");

          // Add the slot to the array of all time slots
          allTimeSlots.push({
            startTime: slotStartTime,
            endTime: slotEndTime,
            statusofBooking: "Empty",
          });
        }
      }
    }

    // Calculate dates for the next 10 occurrences of each specified day
    const next10Dates = [];
    const today = moment();

    for (const entry of schedule) {
      const { day } = entry;

      let currentDay = today.clone().day(validDays.indexOf(day));

      for (let i = 0; i < 10; i++) {
        if (currentDay.isSameOrAfter(today)) {
          next10Dates.push({
            day,
            date: currentDay.format("YYYY-MM-DD"),
          });
        }
        currentDay.add(7, "days");
      }
    }

    // Loop through each date and create/update availability slots
    for (const dateObj of next10Dates) {
      const { day, date } = dateObj;

      // Find or create the availability slot document for the specified day, astrologer, and date
      let availabilitySlot = await AvailabilitySlot.findOne({
        astrologer: astrologerId,
        day,
        date,
      });

      if (!availabilitySlot) {
        // Create a new availability slot if it doesn't exist
        availabilitySlot = new AvailabilitySlot({
          astrologer: astrologerId,
          day,
          date,
          slots: allTimeSlots,
        });
      } else {
        // Update the slots if the availability slot already exists
        availabilitySlot.slots = allTimeSlots;
      }

      // Save the availability slot document
      await availabilitySlot.save();
    }

    return res.status(201).json({
      message: "Time slots created or updated successfully",
      slots: allTimeSlots,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Controller to check availability of a specific astrologer on a given day or date
async function checkAstrologerAvailability(req, res) {
  try {
    const { date, day } = req.body;
    astrologerId = req.params.astrologerId;
    // Ensure that all required data is provided in the request body
    if (!astrologerId || !date || !day) {
      return res
        .status(400)
        .json({ message: "Missing data in the request body" });
    }

    // Find the availability slot document for the specified astrologer, date, and day
    const availabilitySlot = await AvailabilitySlot.findOne({
      astrologer: astrologerId,
      date: date,
      day: day,
    });

    if (!availabilitySlot) {
      return res.status(404).json({ message: "Availability slots not found" });
    }

    // Extract and return the slots array from the availability slot document
    const slots = availabilitySlot.slots;

    return res.status(200).json({ slots });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Controller to override availability slots for specific dates
async function overrideAvailability(req, res) {
  try {
    const { overrides } = req.body;
    const astrologerId = req.params.astrologerId;

    // Initialize an empty array to store all time slots
    const allTimeSlots = [];

    // Loop through each override entry
    for (const override of overrides) {
      const { date, slots } = override;

      // Parse the provided date and calculate the day
      const overrideDate = moment(date, "YYYY-MM-DD");
      const day = overrideDate.format("dddd");

      // Loop through each provided slot for the current day
      for (const slot of slots) {
        const { startTime, endTime } = slot;

        // Parse start and end times as moment objects for easier manipulation
        const startMoment = moment(startTime, "hh:mm A");
        const endMoment = moment(endTime, "hh:mm A");

        // Ensure that the start time is before the end time
        if (!startMoment.isBefore(endMoment)) {
          return res
            .status(400)
            .json({ message: "Start time must be before end time" });
        }

        // Generate slots of 15 minutes interval between start and end times
        const currentMoment = moment(startMoment);
        while (currentMoment.isBefore(endMoment)) {
          const slotStartTime = currentMoment.format("hh:mm A");
          currentMoment.add(15, "minutes");
          const slotEndTime = currentMoment.format("hh:mm A");

          // Add the slot to the array of all time slots
          allTimeSlots.push({
            startTime: slotStartTime,
            endTime: slotEndTime,
            statusofBooking: "Empty",
          });
        }
      }

      // Find or create the availability slot document for the specified day, astrologer, and date
      let availabilitySlot = await AvailabilitySlot.findOne({
        astrologer: astrologerId,
        day,
        date,
      });

      if (!availabilitySlot) {
        // Create a new availability slot if it doesn't exist
        availabilitySlot = new AvailabilitySlot({
          astrologer: astrologerId,
          day,
          date,
          slots: allTimeSlots,
        });
      } else {
        // Update the slots if the availability slot already exists
        availabilitySlot.slots = allTimeSlots;
      }

      // Save the availability slot document
      await availabilitySlot.save();
    }

    return res.status(201).json({
      message: "Time slots overridden successfully",
      slots: allTimeSlots,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  setAvailability,
  checkAstrologerAvailability,
  overrideAvailability,
};
