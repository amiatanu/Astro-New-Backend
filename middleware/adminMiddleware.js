const Astrologer = require("../models/Astrologer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Middleware to authenticate user using JWT token
function authenticateAdmin(req, res, next) {
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

module.exports = { authenticateAdmin };
