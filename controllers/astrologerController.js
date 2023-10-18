const jwt = require("jsonwebtoken");
const Astrologer = require("../models/Astrologer");
const AstrologerCharges = require("../models/Charges");
const AvailabilitySlot = require("../models/AvailabilitySlot");
const bcrypt = require("bcryptjs");
const client = require("twilio")(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

const { Storage } = require("@google-cloud/storage");
const path = require("path");
const storage = new Storage({
	projectId: process.env.GCS_PROJECT_ID,
	keyFilename: process.env.GCS_KEYFILE_PATH,
});
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

// Function to send OTP via Twilio
async function sendOTP(req, res) {
	try {
		const { mobileNumber } = req.body;

		// Generate a random 6-digit OTP
		const otp = Math.floor(100000 + Math.random() * 900000);

		// Send OTP via Twilio SMS
		await client.verify.v2
			.services("VA3fd85fb82579223df03ee53ef7adc2bc")
			.verifications.create({
				to: mobileNumber,
				channel: "sms",
				locale: "en",
			});

		return res.status(200).json({
			message: "OTP sent sucessfully",
			mobileNumber,
			status: true,
		});
	} catch (error) {
		console.log(error, error);
		return res.status(500).json({ error: "Failed to send OTP", status: false });
	}
}

// Function to verify OTP and handle astrologer registration
async function verifyOTP(req, res) {
	try {
		const { mobileNumber, otp } = req.body;
		if (!mobileNumber || !otp) {
			return res
				.status(400)
				.json({ error: "Phone number and OTP are required.", status: false });
		}

		// Verify OTP using Twilio
		const verificationCheck = await client.verify.v2
			.services("VA3fd85fb82579223df03ee53ef7adc2bc")
			.verificationChecks.create({
				to: mobileNumber,
				code: otp,
			});

		if (verificationCheck.status === "approved") {
			// Generate a JWT token for authentication
			const token = jwt.sign(
				{ mobileNumber: mobileNumber },
				process.env.JWT_SECRET,
				{
					expiresIn: "1h",
				}
			);

			return res.status(200).json({
				message: "Mobile Verification Successful",
				mobileNumber,
				token,
				status: true,
			});
		} else {
			return res.status(400).json({ message: "Wrong OTP", status: false });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Verification failed",
			details: error.message,
			status: false,
		});
	}
}

// Function to register an astrologer
async function registerAstrologer(req, res) {
	try {
		// Assuming that the registration data is provided in the request body
		const registrationData = req.body;

		// Create a new astrologer record in the database
		const astrologer = new Astrologer(registrationData);

		//Set astrologer profileStatus to "Under Review"
		astrologer.profileStatus = "Under Review";

		// Save the astrologer data to the database
		await astrologer.save();

		return res.status(201).json({
			message: "Astrologer registered successfully.",
			// astrologer,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to register astrologer",
			details: error.message,
			status: false,
		});
	}
}

//Funtion to verify OTP for setting password
async function verifyOTPForSettingPassword(req, res) {
	try {
		const { mobileNumber, otp } = req.body;
		if (!mobileNumber || !otp) {
			return res
				.status(400)
				.json({ error: "Phone number and OTP are required.", status: false });
		}

		// Verify OTP using Twilio
		const verificationCheck = await client.verify.v2
			.services("VA3fd85fb82579223df03ee53ef7adc2bc")
			.verificationChecks.create({
				to: mobileNumber,
				code: otp,
			});

		if (verificationCheck.status === "approved") {
			// Generate a JWT token for authentication
			const token = jwt.sign(
				{ mobileNumber: mobileNumber, type: "passwordSet" },
				process.env.JWT_SECRET,
				{
					expiresIn: "1h",
				}
			);

			return res.status(200).json({
				message: "OTP Verification Successful",
				mobileNumber,
				token,
				status: true,
			});
		} else {
			return res.status(400).json({ message: "Wrong OTP", status: false });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Verification failed",
			details: error.message,
			status: false,
		});
	}
}

// Function to set a password for an astrologer
async function setPassword(req, res) {
	try {
		const { mobileNumber, password } = req.body;

		// Find the astrologer by mobile number
		const astrologer = await Astrologer.findOne({ mobileNumber });

		if (!astrologer) {
			return res.status(404).json({ message: "Astrologer not found" });
		}

		// Hash the provided password before saving it
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Set the hashed password in the astrologer's profile
		astrologer.password = hashedPassword;

		// Save the updated astrologer data to the database
		await astrologer.save();

		return res.status(200).json({
			message: "Password set successfully",
			// astrologer,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to set password",
			details: error.message,
			status: false,
		});
	}
}

// Function to log in an astrologer via password
async function loginByPassword(req, res) {
	try {
		//mobile number and password to be request body
		const { mobileNumber } = req.body;

		// Find the astrologer by mobile number
		const { _id, fullName, profilePicture } = await Astrologer.findOne({
			mobileNumber,
		});

		// Generate a JWT token for authentication
		const token = jwt.sign(
			{ astrologerId: _id, mobileNumber: mobileNumber },
			process.env.JWT_SECRET,
			{
				expiresIn: "24h",
			}
		);

		return res.status(200).json({
			message: "Password Login Successful",
			_id,
			fullName,
			profilePicture,
			mobileNumber,
			token,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Login failed",
			details: error.message,
			status: false,
		});
	}
}

// Function to log in an astrologer via OTP
async function loginByOTP(req, res) {
	try {
		const { mobileNumber, otp } = req.body;

		// Verify OTP using Twilio
		const verificationCheck = await client.verify.v2
			.services("VA3fd85fb82579223df03ee53ef7adc2bc")
			.verificationChecks.create({
				to: mobileNumber,
				code: otp,
			});

		//Fetch user id
		const astrologer = await Astrologer.findOne({ mobileNumber });

		if (verificationCheck.status === "approved") {
			// Generate a JWT token for authentication
			const token = jwt.sign(
				{ astrologerId: astrologer._id, mobileNumber: mobileNumber },
				process.env.JWT_SECRET,
				{
					expiresIn: "24h",
				}
			);

			return res.status(200).json({
				message: "OTP Login Successful",
				astrologer: astrologer._id,
				fullName: astrologer.fullName,
				profilePicture: astrologer.profilePicture,
				mobileNumber,
				token,
				status: true,
			});
		} else {
			return res.status(401).json({ message: "OTP verification failed" });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Login failed",
			details: error.message,
			status: false,
		});
	}
}

// Function to fetch astrologer profile details
async function fetchAstrologerDetails(req, res) {
	try {
		const { mobileNumber } = req.user;

		// Find the astrologer by mobile number
		const astrologer = await Astrologer.findOne({ mobileNumber });

		if (!astrologer) {
			return res.status(404).json({ message: "Astrologer not found" });
		}
		// Remove the 'password' field from the astrologer object
		const { password, ...astrologerWithoutPassword } = astrologer.toObject();

		// Return astrologer profile details without the 'password' field
		return res.status(200).json({
			message: "Astrologer profile details fetched successfully",
			astrologer: astrologerWithoutPassword,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to fetch astrologer profile details",
			details: error.message,
			status: false,
		});
	}
}

// Function to update astrologer profile
async function updateAstrologerProfile(req, res) {
	try {
		const { mobileNumber } = req.body;

		// Check if astrologer exists
		const astrologer = await Astrologer.findOne({ mobileNumber });

		if (!astrologer) {
			return res.status(404).json({ message: "Astrologer not found" });
		}

		// Assuming that you have the updated profile data in the request body
		const updatedProfileData = req.body;

		// Check if files are present in the request
		if (req.files) {
			const { panImage, aadharImage, degreeImage } = req.files;

			// Upload files to GCS and update filenames
			async function uploadFile(file, destination) {
				if (file) {
					const ext = path.extname(file[0].originalname);
					const filename =
						"profile-" +
						Date.now() +
						"-" +
						Math.floor(Math.random() * 1000) +
						ext;

					// Upload the file to GCS
					const gcsFile = bucket.file(destination + filename);
					await gcsFile.save(file[0].buffer, {
						metadata: {
							contentType: file[0].mimetype,
						},
					});

					return gcsFile.publicUrl();
				}
				return null;
			}

			// Update PAN image
			astrologer.panImage = await uploadFile(panImage, "pan-images/");

			// Update Aadhar image
			astrologer.aadharImage = await uploadFile(aadharImage, "aadhar-images/");

			// Update degree image
			astrologer.degreeImage = await uploadFile(degreeImage, "degree-images/");
		}

		// Update the astrologer's profile data
		Object.assign(astrologer, updatedProfileData);

		// Save the updated astrologer data to the database
		await astrologer.save();

		return res.status(200).json({
			message: "Astrologer profile updated successfully",
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to update astrologer profile",
			details: error.message,
			status: false,
		});
	}
}

// Function to upload profile picture
async function uploadProfilePicture(req, res) {
	try {
		const { mobileNumber } = req.body;

		// Check if astrologer exists
		const astrologer = await Astrologer.findOne({ mobileNumber });

		if (!astrologer) {
			return res.status(404).json({ message: "Astrologer not found" });
		}

		// Assuming you are using multer middleware for file uploads
		if (!req.file) {
			return res
				.status(400)
				.json({ message: "No file uploaded", status: false });
		}

		// Upload the profile picture to GCS
		const ext = path.extname(req.file.originalname);
		const filename =
			"profile-" + Date.now() + "-" + Math.floor(Math.random() * 1000) + ext;
		const gcsFile = bucket.file("profile-pictures/" + filename);

		await gcsFile.save(req.file.buffer, {
			metadata: {
				contentType: req.file.mimetype,
			},
		});

		// Save the GCS URL to the astrologer's profile
		astrologer.profilePicture = gcsFile.publicUrl();

		// Save the updated astrologer data to the database
		await astrologer.save();

		return res.status(200).json({
			message: "Profile picture uploaded successfully",
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to upload profile picture",
			details: error.message,
			status: false,
		});
	}
}

/*                  Set Charges                    */

//Function go Fetch charges of astrologer
async function fetchCharges(req, res) {
	try {
		const { id } = req.params;

		// Check if astrologer exists
		const astrologer = await Astrologer.findById(id);

		if (!astrologer) {
			return res
				.status(404)
				.json({ message: "Astrologer not found", status: false });
		}

		// Extract charges from the astrologer's data
		const { chatCharges, videoCallCharges, audioCallCharges } =
			astrologer.charges;

		return res.status(200).json({
			chatCharges,
			videoCallCharges,
			audioCallCharges,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to fetch charges",
			details: error.message,
			status: false,
		});
	}
}

//Function for setting charges of a Astrologer for first time
async function setCharges(req, res) {
	try {
		const { id } = req.params;
		const { chatCharges, videoCallCharges, audioCallCharges } = req.body;

		// Check if astrologer exists
		const astrologer = await Astrologer.findById(id);

		if (!astrologer) {
			return res
				.status(404)
				.json({ message: "Astrologer not found", status: false });
		}

		// Update charges in the astrologer's data
		astrologer.charges = {
			chatCharges,
			videoCallCharges,
			audioCallCharges,
		};

		// Save the updated astrologer data to the database
		await astrologer.save();

		return res.status(200).json({
			message: "Charges updated successfully",
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to update charges",
			details: error.message,
			status: false,
		});
	}
}

//Function to update charges of Astrologer
async function updateCharges(req, res) {
	try {
		const { id } = req.params;
		const { chatCharges, videoCallCharges, audioCallCharges } = req.body;

		// Check if astrologer exists
		const astrologer = await Astrologer.findById(id);

		if (!astrologer) {
			return res
				.status(404)
				.json({ message: "Astrologer not found", status: false });
		}

		// Update charges in the astrologer's data if provided
		if (chatCharges !== undefined) {
			astrologer.charges.chatCharges = chatCharges;
		}
		if (videoCallCharges !== undefined) {
			astrologer.charges.videoCallCharges = videoCallCharges;
		}
		if (audioCallCharges !== undefined) {
			astrologer.charges.audioCallCharges = audioCallCharges;
		}

		// Save the updated astrologer data to the database
		await astrologer.save();

		return res.status(200).json({
			message: "Charges updated successfully",
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to update charges",
			details: error.message,
			status: false,
		});
	}
}

/*                   Admin                             */

//Function to check total number of astrologers registered
async function getTotalRegisteredAstrologers(req, res) {
	try {
		const totalAstrologers = await Astrologer.countDocuments();

		return res.status(200).json({
			message: "Total number of registered astrologers retrieved successfully.",
			totalAstrologers,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to retrieve total number of astrologers",
			details: error.message,
			status: false,
		});
	}
}

//Function to  change the status as rejected
async function rejectAstrologer(req, res) {
	try {
		var { id } = req.params;

		// Check if the astrologer with the provided ID exists
		const astrologer = await Astrologer.findById(id);

		if (!astrologer) {
			return res.status(404).json({
				error: "Astrologer not found",
				status: false,
			});
		}

		// Update the status field to "rejected"
		astrologer.profileStatus = "Rejected";

		// Save the updated astrologer document
		await astrologer.save();

		return res.status(200).json({
			message: "Astrologer status updated to 'Rejected' successfully.",
			astrologer,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to update astrologer status",
			details: error.message,
			status: false,
		});
	}
}

//Function to change status as Live
async function approvedToLive(req, res) {
	try {
		var { id } = req.params;

		// Check if the astrologer with the provided ID exists
		const astrologer = await Astrologer.findById(id);

		if (!astrologer) {
			return res.status(404).json({
				error: "Astrologer not found",
				status: false,
			});
		}

		// Update the status field to "live"
		if (astrologer.profileStatus === "Live") {
			return res.status(200).json({
				message: "Astrologer status is 'Live' already.",
				astrologer,
				status: true,
			});
		}
		if (astrologer.profileStatus === "Approved") {
			astrologer.profileStatus = "Live";

			// Save the updated astrologer document
			await astrologer.save();

			return res.status(200).json({
				message: "Astrologer status updated to 'Live' successfully.",
				astrologer,
				status: true,
			});
		} else {
			return res.status(200).json({
				message: "Astrologer status is not Approved yet",
				astrologer,
				status: false,
			});
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to update astrologer status",
			details: error.message,
			status: false,
		});
	}
}

// Function to get a list of astrologers with profileStatus "Approved"
async function getApprovedAstrologers(req, res) {
	try {
		// Find astrologers with profileStatus "Approved" and select specific fields
		const approvedAstrologers = await Astrologer.find(
			{ profileStatus: "Approved" },
			"id email fullName mobileNumber profilePicture"
		);

		return res.status(200).json({
			message: "List of approved astrologers retrieved successfully.",
			astrologers: approvedAstrologers,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to retrieve approved astrologers",
			details: error.message,
			status: false,
		});
	}
}

//Function to get the view of single astrologer
async function getAstrologerById(req, res) {
	try {
		var { id } = req.params;

		// Check if the astrologer with the provided ID exists
		const astrologer = await Astrologer.findById(id);

		if (!astrologer) {
			return res.status(404).json({
				error: "Astrologer not found",
				status: false,
			});
		}

		return res.status(200).json({
			message: "Astrologer details retrieved successfully.",
			astrologer,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to retrieve astrologer details",
			details: error.message,
			status: false,
		});
	}
}

// Function to get a list of astrologers with profileStatus "Under Review"
async function getUnderReviewAstrologers(req, res) {
	try {
		// Find astrologers with profileStatus "Under Review" and select specific fields
		const underReview = await Astrologer.find(
			{ profileStatus: "Under Review" },
			"id email fullName mobileNumber profilePicture"
		);

		return res.status(200).json({
			message: "List of Under Review astrologers retrieved successfully.",
			astrologers: underReview,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to retrieve Under Review astrologers",
			details: error.message,
			status: false,
		});
	}
}

//Funtion to change profile status to aprooved by id
async function changeStatusToAprooved(req, res) {
	try {
		var { id } = req.params;
		// console.log(id);

		// Check if the astrologer with the provided ID exists
		const astrologer = await Astrologer.findById(
			id,
			"id email fullName mobileNumber profilePicture profileStatus"
		);

		if (!astrologer) {
			return res.status(404).json({
				error: "Astrologer not found",
				status: false,
			});
		}

		// Update the status field to "live"
		if (astrologer.profileStatus === "Approved") {
			return res.status(200).json({
				message: "Astrologer status is 'Approved' already.",
				astrologer,
				status: true,
			});
		}
		if (astrologer.profileStatus === "Under Review") {
			astrologer.profileStatus = "Approved";

			// Save the updated astrologer document
			await astrologer.save();

			return res.status(200).json({
				message: "Astrologer status updated to 'Approved' successfully.",
				astrologer,
				status: true,
			});
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to update astrologer status",
			details: error.message,
			status: false,
		});
	}
}

//Function to get Rejected Astrologers
async function getRejectedAstrologers(req, res) {
	try {
		// Find astrologers with profileStatus "Rejected" and select specific fields
		const rejectedAstrologers = await Astrologer.find(
			{ profileStatus: "Rejected" },
			"id email fullName mobileNumber profilePicture profileStatus"
		);

		return res.status(200).json({
			message: "List of Rejected astrologers retrieved successfully.",
			astrologers: rejectedAstrologers,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to retrieve Rejected astrologers",
			details: error.message,
			status: false,
		});
	}
}

//Function to get Live Astrologers
async function getLiveAstrologers(req, res) {
	try {
		// Find astrologers with profileStatus "Live" and select specific fields
		const liveAstrologers = await Astrologer.find(
			{ profileStatus: "Live" },
			"id email fullName mobileNumber aboutYourself profilePicture profileStatus experienceInYears rating reviews charges"
		);

		return res.status(200).json({
			message: "List of Live astrologers retrieved successfully.",
			astrologers: liveAstrologers,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to retrieve Live astrologers",
			details: error.message,
			status: false,
		});
	}
}

/*             User                   */
//Function to give review and rating to astrologer
async function giveReviewAndRating(req, res) {
	try {
		const { astrologerId, rating, review } = req.body;

		// Check if astrologer exists
		const astrologer = await Astrologer.findById(astrologerId);

		if (!astrologer) {
			return res.status(404).json({ message: "Astrologer not found" });
		}

		// Update the astrologer's rating and reviews
		astrologer.rating = rating;
		astrologer.reviews.push(review);

		// Save the updated astrologer data to the database
		await astrologer.save();

		return res.status(200).json({
			message: "Review and rating given successfully",
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to give review and rating",
			details: error.message,
			status: false,
		});
	}
}

module.exports = {
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
	rejectAstrologer,
	approvedToLive,
	getApprovedAstrologers,
	getAstrologerById,
	getUnderReviewAstrologers,
	changeStatusToAprooved,
	getRejectedAstrologers,
	getLiveAstrologers,
	updateCharges,
	setCharges,
	fetchCharges,
	giveReviewAndRating,
};
