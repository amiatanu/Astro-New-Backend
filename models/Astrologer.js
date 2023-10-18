const mongoose = require("mongoose");

const astrologerSchema = new mongoose.Schema({
  fullName: String,
  mobileNumber: { type: String, required: true, unique: true },
  email: String,
  dateOfBirth: Date,
  gender: String,
  presentAddress: String,
  permanentAddress: String,
  emergencyContactNumber: String,
  maritalStatus: String,
  astrologerType: [String], // Use an array for multiple checkboxes
  consultationType: [String], // Use an array for multiple checkboxes
  experienceInYears: String,
  highestQualification: String,
  degree: String,
  collegeSchool: String,
  learnAstrologyFrom: String,
  languages: [String], // Use an array for multiple languages
  learnAboutUsFrom: String,
  workingOnOtherPlatform: Boolean,
  platformName: String,
  hoursAvailable: Number,
  reasonToOnboard: String,
  traveledInternationally: String,
  handledForeignClient: String,
  handlingRepetitiveQuestions: String,
  bestQualityAsAstrologer: String,
  expectedEarning: Number,
  aboutYourself: String,
  profilePicture: String,
  socialLinks: {
    instagram: String,
    facebook: String,
    youtube: String,
    other: String,
  },
  profileStatus: {
    type: String,
    default: "Under Review",
  },
  password: String,
  profilePicture: String,
  charges: {
    chatCharges: Number,
    videoCallCharges: Number,
    audioCallCharges: Number,
  },
  panImage: String,
  aadharImage: String,
  degreeImage: String,
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    branchName: String,
  },
  rating: Number, // Rating
  reviews: [String], // reviews

  balance: {
    type: Number,
    default: 0,
  },
  totalConsultation: {
    type: Number,
    default: 0,
  },

  totalCall: {
    type: Number,
    default: 0,
  },
  totalChat: {
    type: Number,
    default: 0,
  },
  totalVideoCall: {
    type: Number,
    default: 0,
  },
});

// Set defaults to null for all fields
astrologerSchema.eachPath((path) => {
  if (!astrologerSchema.path(path).isRequired) {
    astrologerSchema.path(path).default(null);
  }
});

module.exports = mongoose.model("Astrologer", astrologerSchema);
