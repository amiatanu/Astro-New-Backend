const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

// Apply middleware for routes in this controller
router.use(express.urlencoded({ extended: true }));
const {
  sendOTP,
  verifyOTP,
  registerAstrologer,
  verifyOTPForSettingPassword,
  setPassword,
  loginByPassword,
  loginByOTP,
  fetchAstrologerDetails,
  updateAstrologerProfile,
  uploadProfilePicture,
  getTotalRegisteredAstrologers,
  fetchCharges,
  setCharges,
  updateCharges,
} = require("../controllers/astrologerController");

const {
  setAvailability,
  overrideAvailability,
} = require("../controllers/availabilityController");

const {
  getUpcomingConsultationsByAstrologerId,
  getConsultationDetailsById,
  fillQueryAndSolution,
  getPastConsultationsByAstrologerId,
  getPastConsultationDetailsById,
  startCountDown,
  endCountDown,
  astrologerAnswerQuestion,
} = require("../controllers/consultationController");

const { generateRTEToken } = require("../controllers/tokenController");

//astrologer middleware
const {
  checkUserExistsByMobileNumber,
  authenticateAstrologer,
  checkUserNotRegisteredByMobileNumber,
  authenticateUserByPassword,
  authenticateAstrologerForSetPassword,
} = require("../middleware/astrologerMiddleware");

// Define multer storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to send OTP via Twilio SMS
router.post("/sendOTP", checkUserExistsByMobileNumber, sendOTP);

// Route to verify OTP
router.post("/verifyOTP", verifyOTP);

// Route to register astrologer
router.post("/register", registerAstrologer);

// Route to send OTP for astrologer login
router.post("/sendOTPForLogin", checkUserNotRegisteredByMobileNumber, sendOTP);

// Route to login via OTP
router.post("/loginByOTP", loginByOTP);

//Route to send otp for setting password
router.post(
  "/sendOTPForSettingPassword",
  checkUserNotRegisteredByMobileNumber,
  authenticateAstrologer,
  sendOTP
);

//Route to verify OTP for setting password
router.post(
  "/verifyOTPForSettingPassword",
  authenticateAstrologer,
  verifyOTPForSettingPassword
);

// Route to set a password for an astrologer
router.post(
  "/setPassword",
  authenticateAstrologer,
  authenticateAstrologerForSetPassword,
  setPassword
);

// Route to login via password
router.post("/loginByPassword", authenticateUserByPassword, loginByPassword);

// Route to fetch astrologer profile details
router.get(
  "/fetchAstrologerDetails",
  authenticateAstrologer,
  fetchAstrologerDetails
);

// Route to update astrologer profile
router.post(
  "/updateAstrologerProfile",
  authenticateAstrologer,
  upload.fields([
    { name: "panImage", maxCount: 1 },
    { name: "aadharImage", maxCount: 1 },
    { name: "degreeImage", maxCount: 1 },
  ]),
  updateAstrologerProfile
);

// Route to upload profile picture
router.post(
  "/uploadProfilePicture",
  authenticateAstrologer,
  upload.single("profilePicture"),
  uploadProfilePicture
);

//Route to get Astrologers Charges
router.get("/fetchcharges/:id", authenticateAstrologer, fetchCharges);

//Route to set charges of Astrologer
router.post("/setcharges/:id", authenticateAstrologer, setCharges);

//Route to update the charges of astrologer
router.post("/updatecharges/:id", authenticateAstrologer, updateCharges);

/*                 Availability                */

//Route to setAvailability of Astrologer
router.post(
  "/setAvailability/:astrologerId",
  authenticateAstrologer,
  setAvailability
);

router.post("/overrideAvailability/:astrologerId", overrideAvailability);

/*                 Consultation                */

//Route to get upcoming consultations of astrologer
router.get(
  "/getUpcomingConsultations/:astrologerId",
  authenticateAstrologer,
  getUpcomingConsultationsByAstrologerId
);

//Route to get consultation details by id
router.get(
  "/getConsultationDetails/:consultationId",
  authenticateAstrologer,
  getConsultationDetailsById
);

//Route to fill query and solution
router.post(
  "/fillQueryAndSolution/:consultationId",
  authenticateAstrologer,
  fillQueryAndSolution
);

//Route to answer the particular query for consultation
router.post("/astrologeranswerquestion", astrologerAnswerQuestion);

//Route to get past consultations of astrologer
router.get(
  "/getPastConsultations/:astrologerId",
  authenticateAstrologer,
  getPastConsultationsByAstrologerId
);

//Route to get past consultation details by id
router.get(
  "/getPastConsultationDetails/:consultationId",
  authenticateAstrologer,
  getPastConsultationDetailsById
);

/* TO be Moved TO Admin */
//Route to get total number of astrologers registered
router.post(
  "/registeredastrologers",
  authenticateAstrologer,
  getTotalRegisteredAstrologers
);

//==============Token============

//Route to generate astrologer token
router.post(
  "/generatetoken/rte/:channel/:role/:tokentype/:uid/",
  generateRTEToken
);

//Route to start consultation time
router.post("/startcountdown", startCountDown);

//Route to end countdown
router.post("/endcountdown", endCountDown);
module.exports = router;
