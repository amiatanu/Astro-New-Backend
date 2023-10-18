const express = require("express");
const router = express.Router();
const io = require("socket.io");
const {
	authenticateAstrologer,
} = require("../middleware/astrologerMiddleware");

const { authenticateUser } = require("../middleware/userMiddleware");

const {
	authenticateChatToken,
	checkChatClosed,
} = require("../middleware/chatMiddleware");

const {
	initiateChat,
	sendMessage,
	closeChat,
	getChatMessages,
} = require("../controllers/chatController");

// Route to initiate a chat session (Astrologer initiates)
router.post("/initiate", authenticateAstrologer, async (req, res) => {
	try {
		const { astrologerId } = req.user; // Extract authenticated astrologer ID
		const { userId, consultationId, message } = req.body; // Extract user's ID, consultation ID, and initial message
		const chat = await initiateChat(
			astrologerId,
			userId,
			consultationId,
			message
		);

		// Emit a Socket.io event to notify the user's application about the new chat
		const userSocket = io().sockets.connected[userId]; // Assuming you have the user's socket ID
		if (userSocket) {
			userSocket.emit("newChatInitiation", { chatId: chat._id });
		}

		res.status(201).json(chat);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to initiate the chat session" });
	}
});

// Route to send a chat message within a chat room (both user and astrologer can send)
router.post(
	"/send",
	authenticateChatToken,
	checkChatClosed,
	async (req, res) => {
		try {
			const { chatId, message } = req.body; // Extract the chat room ID and message
			const senderId = req.user.userId || req.user.astrologerId; // Determine sender ID based on user role

			const chat = await sendMessage(chatId, senderId, message);
			res.status(201).json(chat);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Failed to send the chat message" });
		}
	}
);

// Route to retrieve chat messages for a specific chat room
router.get("/messages/:chatId", authenticateChatToken, async (req, res) => {
	try {
		const { chatId } = req.params; // Extract the chat room ID
		const chatMessages = await getChatMessages(chatId);
		res.status(200).json(chatMessages);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to retrieve chat messages" });
	}
});

// Route to close the chat room (both astrologer and user can close it)
router.post("/close", async (req, res) => {
	try {
		const { chatId } = req.body; // Extract the chat room ID
		const chat = await closeChat(chatId);
		res.status(200).json({ message: "Chat closed successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to close the chat" });
	}
});

module.exports = router;
