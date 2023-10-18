const Admin = require("../models/Admin");
const User = require("../models/User");
const Astrologer = require("../models/Astrologer");
const jwt = require("jsonwebtoken");
// const multer = require("multer");
const client = require("twilio")(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);
const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
	const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
	return await bcrypt.hash(password, salt); // Hash the password
};

// Function to create NewAdmin
async function createAdmin(req, res) {
	try {
		const { email, password, mobileNumber, name } = req.body;

		// Check if required fields are provided
		if (!email || !password || !mobileNumber || !name) {
			return res.status(400).json({ error: "All fields are required." });
		}

		// Check if the admin already exists
		const existingAdmin = await Admin.findOne({ email });
		if (existingAdmin) {
			return res
				.status(400)
				.json({ error: "Admin with this email already exists." });
		}

		// Hash the password
		const hashedPassword = await hashPassword(password);

		// Create a new admin with the hashed password
		const admin = new Admin({
			email,
			password: hashedPassword,
			mobileNumber,
			name,
		});
		await admin.save();

		return res.status(201).json({ message: "Admin created successfully." });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Failed to create admin." });
	}
}

// Update the loginAdmin function to compare hashed passwords
async function loginAdmin(req, res) {
	try {
		const { email, password } = req.body;

		// Check if both email and password are provided
		if (!email || !password) {
			return res
				.status(400)
				.json({ error: "Email and password are required." });
		}

		// Check if the admin exists
		const admin = await Admin.findOne({ email });

		if (!admin) {
			return res.status(401).json({ error: "Invalid email or password." });
		}

		// Compare the provided password with the hashed password in the database
		const isPasswordValid = await bcrypt.compare(password, admin.password);

		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid email or password." });
		}

		// Generate a JWT token for authentication
		const token = jwt.sign(
			{ email, userId: admin._id },
			process.env.JWT_SECRET,
			{
				expiresIn: "24h",
			}
		);

		return res
			.status(200)
			.json({ token, message: "Admin logged in successfully." });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Failed to login admin." });
	}
}

// Function to get Admin Details
async function viewAdminProfile(req, res) {
	try {
		const { email } = req.user;

		// Exclude the 'password' field from the query result
		const user = await Admin.findOne({ email }).select("-password");

		if (!user) {
			return res.status(404).json({ error: "User not found", status: false });
		}

		return res.status(200).json({
			message: "User profile retrieved successfully",
			user,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to retrieve user profile",
			details: error.message,
			status: false,
		});
	}
}

//Function to verify admin by otp
async function sendVerificationOTP(req, res) {
	try {
		const { mobileNumber } = req.body;
		if (!mobileNumber) {
			return res
				.status(400)
				.json({ error: "Phone number is required.", status: false });
		}
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
	} catch (error) {
		return res.status(500).json({ error: "Failed to send OTP", status: false });
	}
}

// Function to VerifyOTP for mobile number verification
async function verifyAdminOTP(req, res) {
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
			// Check if user exists
			let user = await Admin.findOne({ mobileNumber });

			if (!user) {
				// If user doesn't exist, create a new user
				user = new Admin({ mobileNumber });
				await user.save();
			}

			// Generate a JWT token for authentication
			const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
				expiresIn: "1h",
			});

			return res.status(200).json({
				message: "Login successful",
				uid: user._id,
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

// Function to validate a user's old password
async function validatePassword(email, oldPassword) {
	try {
		// Fetch the user/admin from the database using the email
		const user = await Admin.findOne({ email });

		// If user not found, return false
		if (!user) {
			return false;
		}

		// Compare the provided old password with the stored hashed password
		const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

		return isPasswordValid;
	} catch (error) {
		console.error("Error validating password:", error);
		throw new Error("Error validating password");
	}
}

// Function to update a user's password in the database
async function updatePasswordInDatabase(email, newPassword) {
	try {
		// Hash the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update the password in the database
		await Admin.findOneAndUpdate({ email }, { password: hashedPassword });

		return true; // Password updated successfully
	} catch (error) {
		console.error("Error updating password:", error);
		throw new Error("Error updating password");
	}
}

// Function for updating password
async function updatePassword(req, res) {
	try {
		const email = req.body.email;
		const oldPassword = req.body.oldPassword;
		const newPassword = req.body.newPassword;

		if (!email || !oldPassword || !newPassword) {
			return res
				.status(400)
				.json({ error: "Email, oldPassword, and newPassword are required" });
		}
		// Check if oldPassword matches the current password
		const isPasswordValid = await validatePassword(email, oldPassword);

		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid old password" });
		}

		// Update the password
		await updatePasswordInDatabase(email, newPassword);
		return res.status(201).json({ message: "Password updated successfully" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Failed to update password" });
	}
}

// Function to get all users
async function getAllUsers(req, res) {
	try {
		// Find all users in the database and project only the required fields
		const users = await User.find().select(
			"id name mobileNumber profilePicture"
		);

		return res.status(200).json({
			message: "All users retrieved successfully.",
			users,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to retrieve all users",
			details: error.message,
			status: false,
		});
	}
}

// Function to get the details of a single user by ID
async function getUserById(req, res) {
	try {
		const { id } = req.params;

		// Find the user by ID
		const user = await User.findById(id);

		if (!user) {
			return res.status(404).json({
				error: "User not found",
				status: false,
			});
		}

		return res.status(200).json({
			message: "User details retrieved successfully.",
			user,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to retrieve user details",
			details: error.message,
			status: false,
		});
	}
}

//Function to get list of all astrologers
async function getAllAstrologers(req, res) {
	try {
		// Find all astrologers in the database and select specific fields
		const astrologers = await Astrologer.find().select(
			"_id fullName mobileNumber profilePicture email"
		);

		return res.status(200).json({
			message: "All Astrologer retrieved successfully.",
			astrologers, // Updated variable name
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to retrieve all Astrologer",
			details: error.message,
			status: false,
		});
	}
}

// Function to get the details of a single user by ID
async function getUserByMobileNumber(req, res) {
	try {
		const { mobileNumber } = req.params;

		const user = await User.findOne({ mobileNumber });

		if (!user) {
			return res.status(404).json({ error: "User not found", status: false });
		}

		return res.status(200).json({
			message: "User profile retrieved successfully",
			user,
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to retrieve user profile",
			details: error.message,
			status: false,
		});
	}
}

// Function to update the profile of a single astrologer by ID
async function updateAstrologerProfileById(req, res) {
	try {
		const astrologerId = req.params.id; // Get the astrologer's ID from the request parameters

		// Check if astrologer exists
		const astrologer = await Astrologer.findById(astrologerId);

		if (!astrologer) {
			return res.status(404).json({ message: "Astrologer not found" });
		}

		// Assuming that you have the updated profile data in the request body
		const updatedProfileData = req.body;

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

// Function to update the profile of a single user by ID
async function updateUserProfileById(req, res) {
	try {
		const userId = req.params.id; // Get the user's ID from the request parameters

		// Check if user exists
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		//get updated profile data from the request body
		const updatedProfileData = req.body;

		// Update the user's profile data
		Object.assign(user, updatedProfileData);

		// Save the updated user data to the database
		await user.save();

		return res.status(200).json({
			message: "User profile updated successfully",
			status: true,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Failed to update user profile",
			details: error.message,
			status: false,
		});
	}
}

module.exports = {
	createAdmin,
	loginAdmin,
	viewAdminProfile,
	sendVerificationOTP,
	verifyAdminOTP,
	updatePassword,
	getAllUsers,
	getUserById,
	getAllAstrologers,
	getUserByMobileNumber,
	updateAstrologerProfileById,
	updateUserProfileById,
};
