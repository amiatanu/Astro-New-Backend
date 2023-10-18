const Astrologer = require("../models/Astrologer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Middleware to check if a user exists by mobile number
async function checkUserExistsByMobileNumber(req, res, next) {
	try {
		const { mobileNumber } = req.body;

		//check if mobile number is provided
		if (!mobileNumber) {
			return res
				.status(400)
				.json({ error: "Phone number is required.", status: false });
		}

		const user = await Astrologer.findOne({ mobileNumber });
		if (user) {
			return res.status(409).json({ message: "User already exist" });
		}
		next();
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Server error" });
	}
}

// Middleware to check if a user is not registered by mobile number
async function checkUserNotRegisteredByMobileNumber(req, res, next) {
	try {
		const { mobileNumber } = req.body;

		// Check if mobile number is provided
		if (!mobileNumber) {
			return res
				.status(400)
				.json({ error: "Phone number is required.", status: false });
		}

		const user = await Astrologer.findOne({ mobileNumber });
		if (!user) {
			return res.status(400).json({ message: "User does not exists" });
		} else {
			req.body.user = user._id;
		}
		next();
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Server error" });
	}
}

// Middleware to authenticate user using JWT token
function authenticateAstrologer(req, res, next) {
	const tokenB = req.header("Authorization");
	if (!tokenB) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	try {
		const token = tokenB.replace("Bearer ", "");
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		// console.log(decoded, "  \nauth decoded");
		req.user = decoded;
		next();
	} catch (error) {
		// console.error(error);
		return res.status(401).json({ message: "Token is not valid" });
	}
}

// Middleware to authenticate a user via password
async function authenticateUserByPassword(req, res, next) {
	try {
		const { mobileNumber, password } = req.body;

		// Find the user by mobile number
		const user = await Astrologer.findOne({ mobileNumber });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Check if the provided password matches the stored hashed password
		const passwordMatch = await bcrypt.compare(password, user.password);

		if (!passwordMatch) {
			return res.status(401).json({ message: "Invalid password" });
		}

		// Set the user in the request object for further processing
		req.user = user;
		next();
	} catch (error) {
		// console.error(error);
		return res.status(500).json({ message: "Server error" });
	}
}

//Middleware to check set password otp verification
function authenticateAstrologerForSetPassword(req, res, next) {
	const { token } = req.body;
	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		// console.log(decoded, "  \nsetPAss decoded");
		if (decoded.type !== "passwordSet") {
			return res.status(401).json({ message: "Unauthorized" });
		}
		req.user = decoded.user;
		next();
	} catch (error) {
		// console.error(error);
		return res.status(401).json({ message: "Token is not valid" });
	}
}

module.exports = {
	checkUserExistsByMobileNumber,
	authenticateAstrologer,
	authenticateUserByPassword,
	checkUserNotRegisteredByMobileNumber,
	authenticateAstrologerForSetPassword,
};
