const AvailabilitySlot = require("../models/AvailabilitySlot");
const Consultation = require("../models/Consultation");
const Charges = require("../models/Charges");
const User = require("../models/User");
const ConsultationTimeCounter = require("../models/ConsultationTimeCounter");
const Astrologer = require("../models/Astrologer");

/*                    User Functions                */

// Function to get a list of consultations with User Id
async function getConsultationsByUserId(req, res) {
  try {
    const { userId } = req.params;

    // Find consultations for the specified user
    const consultations = await Consultation.find({ userId });
    res.status(200).json({ consultations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Function to get details of a specific consultation using Consultation id
async function getConsultationDetails(req, res) {
  try {
    const { consultationId } = req.params;

    // Find the consultation by consultationId
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    res.status(200).json({ consultation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller to book a slot
async function bookSlot(req, res) {
  try {
    const astrologerId = req.params.astrologerId;
    const { availabilitySlotId, startTime, endTime, userId } = req.body;

    // Find the specific availability slot for the provided availabilitySlotId
    const availabilitySlot = await AvailabilitySlot.findOne({
      astrologer: astrologerId,
    });

    if (!availabilitySlot) {
      return res.status(404).json({ message: "Availability slot not found" });
    }

    // Check if the desired slot is available for booking
    const desiredSlot = availabilitySlot.slots.find(
      (slot) => String(slot._id) === availabilitySlotId
    );

    if (!desiredSlot) {
      return res
        .status(404)
        .json({ message: "Slot not found within the availability slot" });
    }

    if (desiredSlot.statusofBooking === "Booked") {
      return res.status(400).json({ message: "Slot is already booked" });
    }

    // Change the slot status (for example, from "Empty" to "Booked")
    desiredSlot.statusofBooking = "Booked";

    // Save the updated availabilitySlot
    await availabilitySlot.save();

    // Retrieve astrologer details (name and profilePicture)
    const astrologerDetails = await Astrologer.findOne({ _id: astrologerId });

    if (!astrologerDetails) {
      return res.status(404).json({ message: "Astrologer not found" });
    }

    // Create a new consultation entry
    const consultation = new Consultation({
      userId,
      astrologerId,
      astrologerName: astrologerDetails.fullName, // Include astrologer's name
      profilePicture: astrologerDetails.profilePicture,
      availabilitySlotId,
      consultType: req.body.consultType,
      name: req.body.name,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      timeOfBirth: req.body.timeOfBirth,
      dontKnowTime: req.body.dontKnowTime,
      placeOfBirth: req.body.placeOfBirth,
      enterPartnerDetails: req.body.enterPartnerDetails,
      maritalStatus: req.body.maritalStatus,
      occupation: req.body.occupation,
      concern: req.body.concern,
      status: "Scheduled",
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    });

    // Save the consultation entry
    await consultation.save();

    const response = {
      message: "Consultation slot booked successfully",
      availabilitySlotId,
      startTime,
      endTime,
      consultationId: consultation._id,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller to reschedule a booked slot
async function rescheduleConsultation(req, res) {
  try {
    const consultationId = req.params.consultationId;
    const { availabilitySlotId, startTime, endTime } = req.body;

    // Find the existing consultation by ID
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    // Check if the desired slot is available for rescheduling
    const availabilitySlot = await AvailabilitySlot.findOne({
      "slots._id": availabilitySlotId, // Ensure the slot exists in the availability slot
      "slots.statusofBooking": "Empty", // Ensure the slot is empty
    });

    if (!availabilitySlot) {
      return res
        .status(400)
        .json({ message: "Desired slot is not available for rescheduling" });
    }

    // Check if startTime and endTime are valid Date strings
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid startTime or endTime format" });
    }

    // Update the consultation details
    consultation.availabilitySlotId = availabilitySlotId;
    consultation.startTime = start;
    consultation.endTime = end;

    // Change the slot status (for example, from "Empty" to "Booked")
    const desiredSlot = availabilitySlot.slots.find(
      (slot) => String(slot._id) === availabilitySlotId
    );
    desiredSlot.statusofBooking = "Booked";

    // Save the updated consultation and availabilitySlot
    await consultation.save();
    await availabilitySlot.save();

    return res
      .status(200)
      .json({ message: "Consultation slot rescheduled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller to cancel a consultation
async function cancelConsultation(req, res) {
  try {
    const { consultationId } = req.params;

    // Find the existing consultation by ID
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    // Find the corresponding availability slot for the cancelled consultation
    const availabilitySlot = await AvailabilitySlot.findOne({
      astrologer: consultation.astrologerId,
    });

    if (!availabilitySlot) {
      return res.status(400).json({ message: "Availability slot not found" });
    }

    // Remove the booked slots for this consultation from the availability slot
    if (consultation.bookedSlots) {
      availabilitySlot.bookedSlots = availabilitySlot.bookedSlots.filter(
        (slot) => !consultation.bookedSlots.includes(slot)
      );
    }

    // Update the consultation status to "Cancelled"
    consultation.status = "Cancelled";

    // Save the updated consultation and availability slot
    await consultation.save();
    await availabilitySlot.save();

    res.status(200).json({ message: "Consultation cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller to get upcoming consultation bookings by user id or mobile number
async function getUpcomingConsultations(req, res) {
  try {
    const userId = req.params.userId;
    const currentTime = new Date();

    // Find upcoming consultations for the user by userId or mobile number
    const upcomingConsultations = await Consultation.find({
      userId,
      startTime: { $gt: currentTime },
    }).populate("astrologerId");

    res.status(200).json(upcomingConsultations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller to get solution provided for a specific consultation by consultation id
async function getSolutionForConsultation(req, res) {
  try {
    const consultationId = req.params.consultationId;

    // Find the consultation by consultationId and populate user details
    const consultation = await Consultation.findById(consultationId)
      .populate("userId", "name")
      .select("userId query solution");

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    res.status(200).json(consultation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller to get a list of past consultations by user id
async function getPastConsultations(req, res) {
  try {
    const userId = req.params.userId;
    const currentTime = new Date();

    // Find past consultations for the user by userId
    const pastConsultations = await Consultation.find({
      userId,
      startTime: { $lt: currentTime },
    }).populate("astrologerId");

    res.status(200).json(pastConsultations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/*                    Astrologer Functions                */

// Function to get a list of upcoming consultations with Astrologer Id
async function getUpcomingConsultationsByAstrologerId(req, res) {
  try {
    const astrologerId = req.params.astrologerId;
    const currentTime = new Date();

    const upcomingConsultations = await Consultation.find({
      astrologerId,
      startTime: { $gt: currentTime },
    }).populate("userId"); // Populate user details

    res.status(200).json(upcomingConsultations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Function to get a consultation details by consultation id
async function getConsultationDetailsById(req, res) {
  try {
    const consultationId = req.params.consultationId;

    const consultation = await Consultation.findById(consultationId).populate(
      "userId"
    ); // Populate user details

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    res.status(200).json(consultation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//Function to get past consultations by astrologer id
async function getPastConsultationsByAstrologerId(req, res) {
  try {
    const astrologerId = req.params.astrologerId;
    const currentTime = new Date();

    const pastConsultations = await Consultation.find({
      astrologerId,
      startTime: { $lt: currentTime },
    }).populate("userId"); // Populate user details

    res.status(200).json(pastConsultations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Function to get a past consultation details by consultation id
async function getPastConsultationDetailsById(req, res) {
  try {
    const consultationId = req.params.consultationId;

    const consultation = await Consultation.findById(consultationId).populate(
      "userId"
    ); // Populate user details

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (consultation.startTime > new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot view details of upcoming consultations" });
    }

    res.status(200).json(consultation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Function to fill query details and solution for a consultation by astrologer
async function fillQueryAndSolution(req, res) {
  try {
    const consultationId = req.params.consultationId;
    const {
      query,
      solution,
      remedies_suggested,
      rating,
      what_you_feel,
      description_to_client,
    } = req.body;

    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (consultation.startTime <= new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot update past consultations" });
    }

    consultation.query = query;
    consultation.solution = solution;
    consultation.remedies_suggested = remedies_suggested;
    consultation.rating = rating;
    consultation.what_you_feel = what_you_feel;
    consultation.description_to_client = description_to_client;
    consultation.status = "Completed";

    await consultation.save();

    res
      .status(200)
      .json({ message: "Query details and solution updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//Function to where user gives question after astrologer solution
async function useraskquestion(req, res) {
  try {
    const { consultationId, questionText, userId } = req.body;

    // Find the consultation record by ID
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    // Check if the consultation belongs to the user making the request
    if (consultation.userId == userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!consultation.questionsafterconsultation) {
      consultation.questionsafterconsultation = [];
    }

    // Create a new question object
    const newQuestion = {
      question: questionText,
      answer: null, // Initially set to null since it's awaiting the astrologer's response
    };

    // Push the new question into the questionsafterconsultation array
    consultation.questionsafterconsultation.push(newQuestion);

    // Save the updated consultation record
    await consultation.save();

    return res
      .status(201)
      .json({ message: "Question sent successfully", newQuestion });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to send question" });
  }
}

// Controller function for astrologers to provide answers to questions within a consultation
async function astrologerAnswerQuestion(req, res) {
  try {
    const { consultationId, questionId, answer, astrologerId } = req.body;

    // Find the consultation record by ID
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    // Check if the consultation belongs to the astrologer making the request
    if (consultation.astrologerId.toString() !== astrologerId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find the question within the consultation's questionsafterconsultation array
    const question = consultation.questionsafterconsultation.find(
      (q) => q._id.toString() === questionId
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Update the question with the provided answer
    question.answer = answer;

    // Save the updated consultation record
    await consultation.save();

    return res
      .status(200)
      .json({ message: "Answer provided successfully", question });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to provide answer" });
  }
}

//Function to start countdown
async function startCountDown(req, res) {
  try {
    const { userId, astrologerId, consultationId, consultationtype } = req.body;
    const currentTime = new Date();

    // Try to find an existing consultation record by consultationId
    let consultationRecord = await ConsultationTimeCounter.findOne({
      consultationId,
      astrologerId,
    });

    // If no record exists, create a new one
    if (!consultationRecord) {
      consultationRecord = new ConsultationTimeCounter({
        consultationId,
        userId,
        astrologerId,
        startTime: currentTime,
        constationStatus: "Started",
        consultationtype: consultationtype,
      });
    } else {
      // If a consultation already started
      if (consultationRecord.status !== "completed") {
        return res
          .status(409)
          .json({ message: "Consultation already exists with this user!" });
      } else {
        //update the startTime
        consultationRecord.startTime = currentTime;
      }
    }

    // Save or update the consultation record in the database
    await consultationRecord.save();

    return res
      .status(200)
      .json({ message: "Consultation started successfully" });
  } catch (error) {
    console.error("Error starting consultation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

//Function to check the consultation duration
async function endCountDown(req, res) {
  const { astrologerId, consultationId } = req.body;

  try {
    // Try to find an existing consultation record by consultationId and astrologerId
    let consultationRecord = await ConsultationTimeCounter.findOne({
      consultationId,
      astrologerId,
    });

    if (!consultationRecord) {
      // If no record is found, return a 404 Not Found response
      return res.status(404).json({ error: "Consultation record not found" });
    }

    //if consultaion ended
    if (consultationRecord.consultationStatus === "completed") {
      return res.status(409).json({ message: "Consultation already ended" });
    }
    // Fetch fees of astrologer
    try {
      const charges = await Charges.find({
        astrologerId: astrologerId,
      });

      const astrologer = await Astrologer.find({ _id: astrologerId });
      if (!charges) {
        // Handle case when no data is found for the given astrologerId
        console.log("No charges found for the given astrologerId");
      } else {
        const userId = consultationRecord.userId;
        const startTime = new Date(consultationRecord.startTime);
        const currentTime = new Date();
        const timeDifference = currentTime - startTime;
        let timeDifferenceInMinutes = Math.floor(timeDifference / 60000);
        let fees;
        if (consultationRecord.consultationtype == "video") {
          fees = charges[0].videoCallFee * timeDifferenceInMinutes;
          astrologer[0].totalVideoCall = astrologer[0].totalVideoCall + 1;
        }
        if (consultationRecord.consultationtype == "chat") {
          fees = charges[0].chatFee * timeDifferenceInMinutes;
          astrologer[0].totalChat = astrologer[0].totalChat + 1;
        }
        if (consultationRecord.consultationtype == "audio") {
          fees = charges[0].audioCallFee * timeDifferenceInMinutes;
          astrologer[0].totalCall = astrologer[0].totalCall + 1;
        }

        //update user wallet
        const user = await User.find({ _id: userId });
        if (!astrologer) {
          return res.status(404).json({ error: "Astrologer not found" });
        }
        if (!user) {
          // If no user is found with the given userId, return a 404 response
          return res.status(404).json({ error: "User not found" });
        }
        user[0].wallet.balance = user[0].wallet.balance - fees;
        await user[0].save();

        //update consultation status
        consultationRecord.endTime = currentTime;
        consultationRecord.consultationStatus = "completed"; // You can define your own status logic here
        consultationRecord.consultaionDuration = timeDifferenceInMinutes;

        //Update Astrologer profile
        astrologer[0].totalConsultation = astrologer[0].totalConsultation + 1;
        astrologer[0].totalCall = astrologer[0].totalCall + 1;
        astrologer[0].balance = astrologer[0].balance + fees;
        await astrologer[0].save();

        // Calculate consultation charge
        consultationRecord.consultationCharge = fees;

        // Save the updated consultation record
        await consultationRecord.save();

        return res
          .status(200)
          .json({ message: "Consultation ended and Users balance updated" });
      }
    } catch (error) {
      // Handle errors (e.g., database errors)
      console.error("Error:", error);
    }

    //return res.status(200).json({ message: "Consultation ended successfully" });
  } catch (error) {
    console.error("Error ending consultation:", error);
    // Handle other errors (e.g., database errors) and return a 500 Internal Server Error response
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getConsultationsByUserId,
  rescheduleConsultation,
  cancelConsultation,
  getConsultationDetails,
  bookSlot,
  getUpcomingConsultations,
  getSolutionForConsultation,
  getPastConsultations,
  getUpcomingConsultationsByAstrologerId,
  getConsultationDetailsById,
  fillQueryAndSolution,
  getPastConsultationsByAstrologerId,
  getPastConsultationDetailsById,
  startCountDown,
  endCountDown,
  useraskquestion,
  astrologerAnswerQuestion,
};
