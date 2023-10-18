const jwt = require("jsonwebtoken");
const Chat = require("../models/ChatModel");

function authenticateChatToken(req, res, next) {
	const tokenB = req.header("Authorization");
	if (!tokenB) {
		return res
			.status(401)
			.json({ message: "Access denied. Token not provided." });
	}
	const token = tokenB.replace("Bearer ", "");
	jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
		if (err) {
			return res.status(403).json({ message: "Invalid token." });
		}
		req.user = decodedToken; // Set authenticated user information in req.user
		next();
	});
}

// Middleware to check if the chat room is closed
async function checkChatClosed(req, res, next) {
	try {
		const { chatId } = req.body; // Extract the chat room ID from req.body
		const chat = await Chat.findById(chatId);
		if (!chat) {
			return res.status(404).json({ message: "Chat room not found." });
		}

		if (chat.isClosed) {
			return res.status(403).json({ message: "Chat is closed." });
		}

		next(); // Continue to the next middleware or route handler
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error." });
	}
}

module.exports = { authenticateChatToken, checkChatClosed };
