const express = require("express");
const router = express.Router();
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const multer = require("multer");
const orderController = require("../controllers/orderController");

const multerStorage = multer.memoryStorage(); // Store the file in memory

const multerUpload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB (adjust as needed)
  },
  fileFilter: (req, file, cb) => {
    // Implement any file validation logic here (e.g., file type checks)
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
});

const { authenticateUser } = require("../middleware/userMiddleware");

// Apply middleware for routes in this controller
router.use(express.urlencoded({ extended: true }));

const {
  getLiveAstrologers,
  getAstrologerById,
  giveReviewAndRating,
} = require("../controllers/astrologerController");

const {
  sendOTP,
  verifyOTP,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  sendOTPForUpdate,
  verifyUpdatedMobileNumber,
  giveFeedbackAndRating,
} = require("../controllers/userController");

//wallet controller
const {
  getWalletBalance,
  getTransactionDetails,
  addMoneyToWallet,
  createPaymentOrder,
  getCreditTransactions,
  getDebitTransactions,
} = require("../controllers/walletControllerMain");

//consultation controller
const {
  getConsultationDetails,
  bookSlot,
  getConsultationsByUserId,
  rescheduleConsultation,
  cancelConsultation,
  getUpcomingConsultations,
  getSolutionForConsultation,
  getPastConsultations,
  useraskquestion,
} = require("../controllers/consultationController");

//availability controller
const {
  checkAstrologerAvailability,
} = require("../controllers/availabilityController");

//token controller
const {
  getTokensByUserIdAndAstrologerId,
} = require("../controllers/tokenController");

//Blog controller
const {
  viewBlogUser,
  viewListBlogsUser,
} = require("../controllers/blogController");

//Testimonial controller
const {
  getTestimonials,
  getTestimonialById,
} = require("../controllers/testimonialController");

// Route to send OTP via Twilio SMS for verification
router.post("/sendOTP", sendOTP);

// Route to verify OTP and login or register the user
router.post("/verifyOTP", verifyOTP);

//route to update user profile
router.post("/updateProfile", authenticateUser, updateUserProfile);

// Route to upload profile picture using Google Cloud Storage
router.post(
  "/uploadProfilePicture",
  authenticateUser,
  multerUpload.single("profilePicture"),
  uploadProfilePicture // Use the controller function here
);

// route to fetch user profile details
router.get("/getUserProfile", authenticateUser, getUserProfile);

// Route for sending OTP for updating the mobile number
router.post("/sendOTPForUpdate", authenticateUser, sendOTPForUpdate);

// Route for verifying the updated mobile number with OTP
router.post(
  "/verifyUpdatedMobileNumber",
  authenticateUser,
  verifyUpdatedMobileNumber
);

/*                     Wallet APIs                         */
//router to get wallet balance of user
router.get("/getwalletbalance/:userId", authenticateUser, getWalletBalance);

//route to get transaction details
router.get(
  "/gettransactiondetails/:userId",
  authenticateUser,
  getTransactionDetails
);

//router to to get credit transactions
router.get(
  "/creditedtransactions/:userId",
  authenticateUser,
  getCreditTransactions
);

//router to get the debit transactions
router.get(
  "/debitedtransactions/:userId",
  authenticateUser,
  getDebitTransactions
);

//router to create payment order
router.post("/createorder", authenticateUser, createPaymentOrder);

//route to add money to wallet after payment is successfull
router.post("/addmoneytowallet", /* authenticateUser, */ addMoneyToWallet);

/******************************  Availability Routes   ********************** */
//route to get live astrologers
router.get("/getLiveAstrologers", authenticateUser, getLiveAstrologers);

//route to get astrologer details
router.get("/getAstrologerDetails/:id", authenticateUser, getAstrologerById);

//Rouute to check astrologer availability
router.get(
  "/checkAstrologerAvailability/:astrologerId",
  checkAstrologerAvailability
);

//Route to book a slot
router.post("/bookSlot/:astrologerId", authenticateUser, bookSlot);

// Route to get details of a specific consultation using Consultation id
router.get("/getConsultationDetails/:consultationId", getConsultationDetails);

// Route to get all consultations for a specific user using userId
router.get(
  "/getConsultationsForUser/:userId",
  authenticateUser,
  getConsultationsByUserId
);

// Route to reschedule a consultation
router.post(
  "/rescheduleConsultation/:consultationId",
  authenticateUser,
  rescheduleConsultation
);

// Route to cancel a consultation
router.post(
  "/cancelConsultation/:consultationId",
  authenticateUser,
  cancelConsultation
);

// Route to get upcoming consultations for a user
router.get(
  "/getUpcomingConsultations/:userId",
  authenticateUser,
  getUpcomingConsultations
);

// Route to get solution for a consultation
router.get(
  "/getSolutionForConsultation/:consultationId",
  authenticateUser,
  getSolutionForConsultation
);

// Route to get past consultations for a user
router.get(
  "/getPastConsultations/:userId",
  authenticateUser,
  getPastConsultations
);

//Route to get token for video call audio call and chat
router.get(
  "/getTokensByUserIdAndAstrologerId/:userId/:astrologerId",
  getTokensByUserIdAndAstrologerId
);

/*                  Blogs                   */
// Route to get a specific blog
router.get("/viewBlog/:id", authenticateUser, viewBlogUser);

// Route to get all blogs
router.get("/viewListBlogs", authenticateUser, viewListBlogsUser);

// create order by user id
router.post("/createorderforshopping", orderController.createOrder);

/*                 Testimonials               */
router.get("/testimonials/getTestimonials", authenticateUser, getTestimonials);

router.get(
  "/testimonials/getTestimonial/:id",
  authenticateUser,
  getTestimonialById
);

/*             Review and Rating                    */

// Route to get review and rating of astrologer///
router.post("/giveReviewAndRating", authenticateUser, giveReviewAndRating); //need to re check this ====>maybe wrong controller

//Route to get review and rating of astrologer
router.post("/userfeedbackandratingtoastrologer", giveFeedbackAndRating);

//=============QUery and Solutions==========

//user asks question

router.post("/useraskquestion", useraskquestion);
module.exports = router;
