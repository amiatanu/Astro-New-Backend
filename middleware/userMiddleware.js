const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Middleware to check if a user exists by mobile number
async function checkUserExistsByMobileNumber(req, res, next) {
	try {
		const { mobileNumber } = req.body;
		const user = await User.findOne({ mobileNumber });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		req.user = user;
		next();
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Server error" });
	}
}

function authenticateUser(req, res, next) {
	const tokenB = req.header("Authorization"); // Expecting the token in the "Authorization" header

	if (!tokenB) {
		return res
			.status(401)
			.json({ message: "Authentication failed", status: false });
	}

	try {
		const token = tokenB.replace("Bearer ", "");
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next(); // Authentication successful, proceed to the next middleware or route
	} catch (error) {
		return res
			.status(401)
			.json({ message: "Authentication failed", status: false });
	}
}

module.exports = { checkUserExistsByMobileNumber, authenticateUser };
