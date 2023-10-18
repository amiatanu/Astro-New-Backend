const express = require("express");
const router = express.Router();
const multer = require("multer");

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

const {
	createAdmin,
	loginAdmin,
	viewAdminProfile,
	getAllUsers,
	getUserById,
	getAllAstrologers,
	updatePassword,
	getUserByMobileNumber,
	updateAstrologerProfileById,
	updateUserProfileById,
} = require("../controllers/adminControllers");

// Apply middleware for routes in this controller
router.use(express.urlencoded({ extended: true }));
const {
	getTotalRegisteredAstrologers,
	rejectAstrologer,
	approvedToLive,
	getApprovedAstrologers,
	getAstrologerById,
	getUnderReviewAstrologers,
	changeStatusToAprooved,
	getRejectedAstrologers,
	getLiveAstrologers,
} = require("../controllers/astrologerController");

const { getNumberOfUsers } = require("../controllers/userController");

const { authenticateAdmin } = require("../middleware/adminMiddleware");

// Route to createAdmin
router.post("/createAdmin", authenticateAdmin, createAdmin);

// Route to login admin
router.post("/loginAdmin", loginAdmin);

// Route to display Admin details
router.get("/viewAdminprofile", authenticateAdmin, viewAdminProfile);

//Route to get all users by admin
router.get("/getallusers", authenticateAdmin, getAllUsers);

//Route to get user details by id
router.get("/getuserbyid/:id", authenticateAdmin, getUserById);

//Route to get user details by mobile number
router.get(
	"/getUserByMobileNumber/:mobileNumber",
	authenticateAdmin,
	getUserByMobileNumber
);

//Route to get all astrologer details
router.get("/getallastrologers", authenticateAdmin, getAllAstrologers);

//Route to update admin password  //fixed
router.post("/updatepassword", authenticateAdmin, updatePassword);

//router to get status Under Review astrologers
router.get(
	"/getunderreviewastrologers",
	authenticateAdmin,
	getUnderReviewAstrologers
);

//router to get details of single a astrologer
router.get("/getastrologerbyid/:id", authenticateAdmin, getAstrologerById);

//router  to get list of Approved astrologers
router.get(
	"/getapprovedastrologers",
	authenticateAdmin,
	getApprovedAstrologers
);

//rouuter to change status from Approved to Live
router.post("/approvedtolive/:id", authenticateAdmin, approvedToLive);

//router to change the status of the astrologers as rejected
router.post("/rejectastrologer/:id", authenticateAdmin, rejectAstrologer);

//router for total registered astrologers
router.get(
	"/gettotalregisteredastrologers",
	authenticateAdmin,
	getTotalRegisteredAstrologers
);

//route to get number of users registered
router.get("/getnumberofusersregistered", authenticateAdmin, getNumberOfUsers);

//route to change status to approved
router.post(
	"/changeStatusToAprooved/:id",
	authenticateAdmin,
	changeStatusToAprooved
);

//route to get rejected astrologers
router.get(
	"/getRejectedAstrologers",
	authenticateAdmin,
	getRejectedAstrologers
);

//route to get live astrologers
router.get("/getLiveAstrologers", authenticateAdmin, getLiveAstrologers);

//router to update astrologer profile by id
router.put(
	"/updateAstrologerProfileById/:id",
	authenticateAdmin,
	updateAstrologerProfileById
);

//router to update user profile by id
router.put(
	"/updateUserProfileById/:id",
	authenticateAdmin,
	updateUserProfileById
);

/*           Testimonials             */
const {
	getTestimonialById,
	getTestimonials,
	updateTestimonial,
	deleteTestimonial,
	createTestimonial,
} = require("../controllers/testimonialController");

router.post(
	"/testimonials/createTestimonial",
	authenticateAdmin,
	multerUpload.single("userProfilePicture"),
	createTestimonial
);
router.get("/testimonials/getTestimonials", authenticateAdmin, getTestimonials);
router.get(
	"/testimonials/getTestimonial/:id",
	authenticateAdmin,
	getTestimonialById
);
router.put(
	"/testimonials/updateTestimonial/:id",
	authenticateAdmin,
	updateTestimonial
);
router.delete(
	"/testimonials/deleteTestimonial/:id",
	authenticateAdmin,
	deleteTestimonial
);

module.exports = router;
